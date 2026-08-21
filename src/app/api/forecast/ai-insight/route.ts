import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { ForecastHorizon, LocalEventInput } from '@/lib/forecast/holtWinters';

const INDO_MONTHS_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatIndoDateRange(startDateStr: string, endDateStr: string): string {
  const s = new Date(startDateStr);
  const e = new Date(endDateStr);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${INDO_MONTHS_NAMES[e.getMonth()]} ${e.getFullYear()}`;
  }
  return `${s.getDate()} ${INDO_MONTHS_NAMES[s.getMonth()]} – ${e.getDate()} ${INDO_MONTHS_NAMES[e.getMonth()]} ${e.getFullYear()}`;
}

interface AiInsightRequestBody {
  horizon: ForecastHorizon;
  businessId?: string;
  forceRefresh?: boolean;
  total_projected_revenue?: number;
  growth_percentage?: number;
  busy_summary?: { count: number; days_label: string };
  quiet_summary?: { count: number; days_label: string };
  is_fallback_mode?: boolean;
  events?: LocalEventInput[];
}

export async function POST(request: Request) {
  try {
    const body: AiInsightRequestBody = await request.json();
    const {
      horizon = '7_days',
      businessId: customBizId,
      forceRefresh = false,
      total_projected_revenue = 0,
      growth_percentage = 0,
      busy_summary = { count: 0, days_label: 'Tidak ada' },
      quiet_summary = { count: 0, days_label: 'Tidak ada' },
      is_fallback_mode = false,
      events = [],
    } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessId: string | null = customBizId || null;

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

      if (!businessId) {
        const { data: firstBiz } = await supabase
          .from('businesses')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (firstBiz) businessId = firstBiz.id;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Cek Caching di Database (jika tidak dipaksa forceRefresh)
    if (!forceRefresh && businessId) {
      const { data: cachedForecast } = await supabase
        .from('sales_forecasts')
        .select('ai_qualitative_note, created_at')
        .eq('business_id', businessId)
        .eq('forecast_date', todayStr)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedForecast?.ai_qualitative_note) {
        return NextResponse.json({
          success: true,
          ai_qualitative_note: cachedForecast.ai_qualitative_note,
          cached: true,
        });
      }
    }

    // 2. Format Event Lokal dengan Tanggal Spesifik
    const eventsFormattedList = events.map((e) => {
      const dateRange = formatIndoDateRange(e.start_date, e.end_date);
      const loc = e.city_name ? `${e.city_name}, ${e.province_name}` : e.province_name;
      const impactText = e.expected_tourist_impact === 'massive' ? '+75% (Sangat Masif)' : e.expected_tourist_impact === 'high' ? '+45% (Tinggi)' : '+25% (Sedang)';
      return `• Nama Event: "${e.title}" | Tanggal: ${dateRange} | Lokasi: ${loc} | Potensi Lonjakan Wisatawan: ${impactText}`;
    }).join('\n');

    let fallbackEventNote = '';
    if (events.length > 0) {
      const firstEv = events[0];
      const dateRange = formatIndoDateRange(firstEv.start_date, firstEv.end_date);
      const loc = firstEv.city_name ? `${firstEv.city_name}, ${firstEv.province_name}` : firstEv.province_name;
      fallbackEventNote = ` Terdapat agenda daerah "${firstEv.title}" pada tanggal ${dateRange} di ${loc}. Segera siapkan stok produk unggulan & oleh-oleh untuk menyambut kunjungan wisatawan!`;
    }

    const formattedRevenue = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total_projected_revenue);
    const apiKey = process.env.GEMINI_API_KEY;

    let aiNarrative = '';

    if (!apiKey) {
      aiNarrative = `Omzet diprediksi mencapai ${formattedRevenue} (${growth_percentage >= 0 ? '+' : ''}${growth_percentage}% vs periode lalu). Hari ramai diperkirakan pada (${busy_summary.days_label}), sementara hari sepi pada (${quiet_summary.days_label}). Kurangi belanja stok bahan segar pada hari sepi untuk efisiensi modal, dan perbanyak stok siap jual saat hari ramai.${fallbackEventNote}`;
    } else {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

        const promptText = `
Anda adalah Asisten Bisnis AI Khusus UMKM (Batik, Kuliner, Oleh-oleh, Kerajinan) di Daerah Istimewa Yogyakarta & Jawa Tengah.

Berikut data ringkasan proyeksi toko:
- Total Proyeksi Omzet: ${formattedRevenue} (${growth_percentage >= 0 ? '+' : ''}${growth_percentage}% vs periode lalu)
- Hari Diprediksi Ramai (${busy_summary.count} hari): ${busy_summary.days_label}
- Hari Diprediksi Sepi (${quiet_summary.count} hari): ${quiet_summary.days_label}
- Event Kebudayaan/Pariwisata Daerah DIY-Jateng Terdeteksi:
${eventsFormattedList || 'Tidak ada event khusus dalam periode ini'}
- Status Data: ${is_fallback_mode ? 'Histori awal (Cold Start)' : 'Histori matang (Holt-Winters)'}

Instruksi Penting:
Buat 1 paragraf ringkas (3-4 kalimat) bergaya lugas, ramah, dan solutif:
1. Sebutkan perkiraan omzet serta hari puncak dan hari sepi.
2. Berikan instruksi konkret terkait alokasi modal dan persiapan stok bahan baku (kapan harus tambah stok, kapan harus menekan belanja bahan segar).
3. JIKA ADA EVENT DAERAH TERDAFTAR DI ATAS, ANDA WAJIB MENYEBUTKAN SECARA SPESIFIK:
   - NAMA LENGKAP EVENT
   - RENTANG TANGGAL PELAKSANAANNYA (contoh: "pada tanggal 20–23 Agustus 2026")
   - LOKASI DAERAHNYA (Kota/Kabupaten & Provinsi)
   - Serta instruksi menambah persediaan produk oleh-oleh khas/unggulan untuk menyambut kunjungan wisatawan.
Hindari jargon teknis seperti 'Holt-Winters' atau 'MAPE'.
`;

        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: promptText,
            });
            if (response.text) {
              aiNarrative = response.text;
              break;
            }
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.warn(`Lazy Forecast AI: Model ${model} failed, trying next candidate...`, errMsg);
          }
        }

        if (!aiNarrative) {
          aiNarrative = `Omzet diprediksi mencapai ${formattedRevenue} (${growth_percentage >= 0 ? '+' : ''}${growth_percentage}%). Tambah stok produk unggulan saat hari ramai (${busy_summary.days_label}) dan tekan belanja bahan segar pada hari sepi (${quiet_summary.days_label}).${fallbackEventNote}`;
        }
      } catch (err) {
        console.warn('Gemini API call fallback:', err);
        aiNarrative = `Omzet diprediksi mencapai ${formattedRevenue} (${growth_percentage >= 0 ? '+' : ''}${growth_percentage}%). Tambah stok produk unggulan saat hari ramai (${busy_summary.days_label}) dan tekan belanja bahan baku segar pada hari sepi (${quiet_summary.days_label}) untuk efisiensi modal kas.${fallbackEventNote}`;
      }
    }

    // 3. Simpan ke Cache di Database jika businessId valid
    if (businessId && aiNarrative) {
      try {
        await supabase
          .from('sales_forecasts')
          .insert({
            business_id: businessId,
            forecast_date: todayStr,
            predicted_sales: total_projected_revenue,
            confidence_lower: Math.round(total_projected_revenue * 0.85),
            confidence_upper: Math.round(total_projected_revenue * 1.15),
            ai_qualitative_note: aiNarrative,
          });
      } catch (dbErr) {
        console.warn('Failed to cache AI narrative to DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      ai_qualitative_note: aiNarrative,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating Lazy AI Insight:', error);
    return NextResponse.json({ error: 'Gagal membuat narasi AI Insight' }, { status: 500 });
  }
}
