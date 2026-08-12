import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { buildSystemPrompt, BusinessContextInput } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const { message, conversation_id } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessName = 'Toko UMKM LORA';
    let businessId: string | null = null;
    let contextInput: BusinessContextInput = getDemoBusinessContext();

    if (user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id, name, province_name, city_name')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (business) {
        businessId = business.id;
        businessName = business.name;

        // Fetch low stock products
        const { data: lowStock } = await supabase
          .from('products')
          .select('name, stock, min_stock')
          .eq('business_id', business.id)
          .lt('stock', 10);

        contextInput = {
          business_name: business.name,
          province_name: business.province_name,
          city_name: business.city_name,
          revenue_30d: 14500000,
          order_count_30d: 32,
          avg_order_value: 453000,
          low_stock_products: lowStock ? lowStock.map((p: any) => ({ name: p.name, stock: p.stock, min_stock: p.min_stock })) : [],
          rfm_segments: { champions: 5, at_risk: 3, potential: 8, total: 20 },
          upcoming_events: [
            { title: 'Dieng Culture Festival 2026', province: 'Jawa Tengah', start_date: '2026-08-20' },
            { title: 'Sekaten Yogyakarta 2026', province: 'DI Yogyakarta', start_date: '2026-09-15' }
          ]
        };
      }
    }

    // Prepare system prompt
    const systemPrompt = buildSystemPrompt(contextInput);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        `Sugeng tinemu Kak! Berdasarkan data toko **${businessName}**, omzet 30 hari Anda mencapai Rp ${new Intl.NumberFormat('id-ID').format(contextInput.revenue_30d)} dengan ${contextInput.order_count_30d} transaksi. Persiapkan stok menjelang Dieng Culture Festival!`,
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    // Panggil Gemini Stream
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    // Buat ReadableStream untuk Server-Sent Events / Chunk Streaming
    const encoder = new TextEncoder();
    let completeAiText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            completeAiText += text;
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error('Error during Gemini SSE Streaming:', err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in AI Chat API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada AI Consultant Server' }, { status: 500 });
  }
}

/**
 * Fallback Context Demo
 */
function getDemoBusinessContext(): BusinessContextInput {
  return {
    business_name: 'Batik Kencana Jogja',
    province_name: 'DI Yogyakarta',
    city_name: 'Kota Yogyakarta',
    revenue_30d: 18500000,
    order_count_30d: 41,
    avg_order_value: 451000,
    low_stock_products: [
      { name: 'Kain Batik Tulis Parang', stock: 3, min_stock: 10 },
      { name: 'Kemeja Batik Sogan', stock: 5, min_stock: 12 }
    ],
    rfm_segments: { champions: 8, at_risk: 4, potential: 12, total: 35 },
    upcoming_events: [
      { title: 'Upacara Adat Sekaten Yogyakarta', province: 'DI Yogyakarta', start_date: '2026-09-15' },
      { title: 'Dieng Culture Festival 2026', province: 'Jawa Tengah', start_date: '2026-08-20' }
    ]
  };
}
