import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import {
  calculateBusinessHealthScore,
  getDeterministicBhsRecommendation,
} from '@/lib/engines/bhs-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessIdParam = searchParams.get('businessId');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessId: string | null = businessIdParam || null;

    // 1. Cari business yang dimiliki user jika businessId tidak disertakan
    if (!businessId) {
      if (user) {
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (business) businessId = business.id;
      }

      // Fallback: Jika belum punya toko / belum login, ambil toko pertama dari database
      if (!businessId) {
        const { data: firstBiz } = await supabase
          .from('businesses')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (firstBiz) businessId = firstBiz.id;
      }
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Toko tidak ditemukan.' }, { status: 404 });
    }

    // Ambil data detail profil bisnis untuk mendapatkan nama provinsi (DIY / Jateng)
    const { data: businessDetail } = await supabase
      .from('businesses')
      .select('name, province_name')
      .eq('id', businessId)
      .maybeSingle();

    const businessProvince = businessDetail?.province_name || 'DI Yogyakarta';

    // =========================================================================
    // 2. Fetch data untuk BHS Engine
    // =========================================================================

    // Fetch order 90 hari terakhir (dengan join order_items)
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - 90);

    const { data: rawOrders } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, customer_id, payment_status, order_status, order_items(quantity)')
      .eq('business_id', businessId)
      .gte('created_at', lookbackDate.toISOString())
      .order('created_at', { ascending: false });

    // Fetch produk toko
    const { data: rawProducts } = await supabase
      .from('products')
      .select('id, stock, price')
      .eq('business_id', businessId);

    // Fetch master event regional
    const { data: rawEvents } = await supabase
      .from('local_events')
      .select('id, title, province_name, start_date, end_date, expected_tourist_impact')
      .order('start_date', { ascending: true });

    // =========================================================================
    // 3. Proses Agregasi
    // =========================================================================
    const orders = (rawOrders || []).map(o => ({
      id: o.id,
      total_amount: Number(o.total_amount || 0),
      created_at: o.created_at,
      customer_id: o.customer_id,
      payment_status: o.payment_status || 'pending',
      order_status: o.order_status || 'pending',
    }));

    const products = (rawProducts || []).map(p => ({
      id: p.id,
      stock: Number(p.stock || 0),
      min_stock: Number((p as any).min_stock || 10),
      price: Number(p.price || 0),
    }));

    const localEvents = (rawEvents || []).map(e => ({
      id: e.id,
      title: e.title,
      province_name: e.province_name,
      start_date: e.start_date,
      end_date: e.end_date,
      expected_tourist_impact: (e.expected_tourist_impact as 'low' | 'medium' | 'high' | 'massive') || 'medium',
    }));

    // Hitung kuantitas produk terjual dalam 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let soldQuantity30Days = 0;
    if (rawOrders && rawOrders.length > 0) {
      rawOrders.forEach(o => {
        const oDate = new Date(o.created_at);
        const isRecent = oDate >= thirtyDaysAgo;
        const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
        
        if (isRecent && isSuccessful && o.order_items) {
          const itemsArray = Array.isArray(o.order_items) ? o.order_items : [o.order_items];
          itemsArray.forEach((item: any) => {
            soldQuantity30Days += Number(item.quantity || 0);
          });
        }
      });
    }

    // =========================================================================
    // 4. Hitung Skor BHS menggunakan Engine
    // =========================================================================
    const breakdown = calculateBusinessHealthScore({
      orders,
      products,
      localEvents,
      businessProvince,
      soldQuantity30Days,
    });

    // =========================================================================
    // 5. Generate AI Narrative
    // =========================================================================
    const aiNarrative = await generateBhsAiNarrative(breakdown, businessDetail?.name || 'Toko Anda', businessProvince);

    // =========================================================================
    // 6. Simpan hasil kalkulasi ke database business_health_scores
    // =========================================================================
    const { error: insertError } = await supabase
      .from('business_health_scores')
      .insert({
        business_id: businessId,
        overall_score: breakdown.overall_score,
        revenue_score: breakdown.revenue_score,
        margin_score: breakdown.margin_score,
        inventory_turn_score: breakdown.inventory_turn_score,
        retention_score: breakdown.retention_score,
        safety_stock_score: breakdown.safety_stock_score,
        event_adaptability_score: breakdown.event_adaptability_score,
        ai_narrative: aiNarrative,
        calculated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.warn('Gagal menyimpan riwayat BHS ke database:', insertError.message);
    }

    return NextResponse.json({
      success: true,
      business_id: businessId,
      business_name: businessDetail?.name,
      ...breakdown,
      ai_narrative: aiNarrative,
    });

  } catch (error) {
    console.error('Error in GET BHS API:', error);
    return NextResponse.json({ error: 'Gagal melakukan perhitungan Business Health Score' }, { status: 500 });
  }
}

/**
 * Panggilan ke Google Gemini API untuk analisis naratif kualitatif BHS
 */
async function generateBhsAiNarrative(
  breakdown: any,
  businessName: string,
  businessProvince: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const deterministicRecs = getDeterministicBhsRecommendation(breakdown);

  if (!apiKey) {
    return deterministicRecs.join(' ');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

    const promptText = `
Anda adalah Asisten AI LORA untuk Konsultan Bisnis UMKM di ${businessProvince}.
Menganalisis tingkat kesehatan bisnis "${businessName}" berdasarkan skor Business Health Score (skala 0-100):
- Skor Keseluruhan: ${breakdown.overall_score}/100
- Detail Pilar:
  1. Omzet (Revenue): ${breakdown.revenue_score}/100
  2. Profit Margin (Margin): ${breakdown.margin_score}/100
  3. Turn Rate Stok (Inventory Turn): ${breakdown.inventory_turn_score}/100
  4. Retensi Pelanggan (Customer Retention): ${breakdown.retention_score}/100
  5. Keamanan Stok (Safety Stock): ${breakdown.safety_stock_score}/100
  6. Adaptasi Event Daerah (Event Adaptability): ${breakdown.event_adaptability_score}/100

Tugas:
Buat narasi analisis strategis sebanyak 1 paragraf (3-4 kalimat) yang lugas, ramah, dan solutif untuk pedagang UMKM lokal:
1. Simpulkan kondisi kesehatan toko saat ini berdasarkan nilai overall score (tinggi, sedang, atau rendah).
2. Sebutkan pilar terlemah yang mendesak untuk diperbaiki.
3. Berikan saran aksi taktis terarah (misal: restock segera, kurangi belanja bahan, buat diskon pembeli setia, atau manfaatkan event budaya pariwisata regional terdekat).
Gunakan bahasa Indonesia sehari-hari yang mudah dipahami, hindari istilah teknis matematika yang rumit.
`;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
        });
        if (response.text) return response.text.trim();
      } catch (err: unknown) {
        console.warn(`BHS AI: Model ${model} failed, trying next candidate...`);
      }
    }

    return deterministicRecs.join(' ');
  } catch (err) {
    console.warn('BHS Gemini API call fallback:', err);
    return deterministicRecs.join(' ');
  }
}
