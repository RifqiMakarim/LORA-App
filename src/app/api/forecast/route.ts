import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { 
  generateHybridSalesForecast, 
  ForecastHorizon, 
  HistoricalSalesPoint, 
  LocalEventInput 
} from '@/lib/engines/predictive-forecast';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const horizonParam = (searchParams.get('horizon') || '30_days_daily') as ForecastHorizon;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessCategory = 'Batik';
    let businessId: string | null = null;

    if (user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (business) {
        businessId = business.id;
      }
    }

    // 1. Fetch data historis transaksi
    let historicalPoints: HistoricalSalesPoint[] = [];

    if (businessId) {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: true });

      if (orders && orders.length > 0) {
        // Kelompokkan per tanggal
        const dateGroupMap = new Map<string, { total: number; count: number }>();

        orders.forEach(o => {
          const dateStr = new Date(o.created_at).toISOString().split('T')[0];
          if (!dateGroupMap.has(dateStr)) {
            dateGroupMap.set(dateStr, { total: 0, count: 0 });
          }
          const curr = dateGroupMap.get(dateStr)!;
          curr.total += Number(o.total_amount || 0);
          curr.count += 1;
        });

        historicalPoints = Array.from(dateGroupMap.entries()).map(([date, val]) => ({
          date,
          sales_amount: val.total,
          order_count: val.count,
        }));
      }
    }

    // Fallback data historis jika kosong (Cold-start demo)
    if (historicalPoints.length === 0) {
      historicalPoints = getDemoHistoricalSales();
    }

    // 2. Fetch data local_events DIY & Jawa Tengah
    let localEvents: LocalEventInput[] = [];
    const { data: eventsData } = await supabase
      .from('local_events')
      .select('id, title, province_name, city_name, start_date, end_date, expected_tourist_impact')
      .order('start_date', { ascending: true });

    if (eventsData && eventsData.length > 0) {
      localEvents = eventsData.map((e: any) => ({
        id: e.id,
        title: e.title,
        province_name: e.province_name,
        city_name: e.city_name,
        start_date: e.start_date,
        end_date: e.end_date,
        expected_tourist_impact: e.expected_tourist_impact || 'medium',
      }));
    } else {
      localEvents = getDemoLocalEvents();
    }

    // 3. Kalkulasi Math Predictive Forecast Engine
    const forecastResult = generateHybridSalesForecast(
      historicalPoints,
      localEvents,
      horizonParam,
      businessCategory
    );

    // 4. Panggil Gemini API (@google/genai) untuk narasi kualitatif strategis
    const aiQualitativeNarrative = await generateAiStrategicNarrative(forecastResult, localEvents);
    forecastResult.ai_qualitative_note = aiQualitativeNarrative;

    return NextResponse.json(forecastResult);

  } catch (error) {
    console.error('Error generating Sales Forecast API:', error);
    return NextResponse.json({ error: 'Gagal membuat kalkulasi prediksi penjualan' }, { status: 500 });
  }
}

/**
 * Panggilan ke Google Gemini API (@google/genai) untuk analisis naratif kualitatif
 */
async function generateAiStrategicNarrative(
  forecast: ReturnType<typeof generateHybridSalesForecast>,
  events: LocalEventInput[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `Berdasarkan proyeksi matematik, omzet Anda diprediksi mencapai Rp ${new Intl.NumberFormat('id-ID').format(forecast.total_projected_revenue)} dengan pertumbuhan ${forecast.growth_percentage}%. Disarankan menambah stok 20% menjelang event kebudayaan daerah terdekat.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    const promptText = `
Anda adalah Konsultan Bisnis AI Senior khusus UMKM sektor Batik, Kuliner, dan Kerajinan di Daerah Istimewa Yogyakarta & Jawa Tengah.

Berikut data proyeksi penjualan toko UMKM:
- Status Toko: ${forecast.is_cold_start ? 'Toko Baru / Cold-Start Category Benchmark' : 'Toko Beroperasi'}
- Estimasi Total Proyeksi Omzet: Rp ${new Intl.NumberFormat('id-ID').format(forecast.total_projected_revenue)}
- Est. Pertumbuhan: ${forecast.growth_percentage}%
- Event Kebudayaan/Pariwisata Terdekat: ${events.map(e => `${e.title} (${e.province_name}, ${e.start_date})`).join(', ')}

Berikan 3 poin rekomendasi strategis konkret (persiapan stok, strategi harga/paket promosi, dan momentum event) yang singkat, padat, ramah, dan bernuansa lokal (max 3-4 kalimat).
`;

    const response = await ai.models.generateContent({
      model,
      contents: promptText,
    });

    return response.text || 'Lakukan penyesuaian stok dan promosikan produk unggulan menjelang event kebudayaan lokal terdekat.';
  } catch (err) {
    console.warn('Gemini API call fallback for forecast narrative:', err);
    return `Proyeksi omzet periode ini mencapai Rp ${new Intl.NumberFormat('id-ID').format(forecast.total_projected_revenue)}. Manfaatkan lonjakan wisatawan pada event daerah terdekat dengan menyiapkan produk terlaris!`;
  }
}

/**
 * Fallback Data Historis Penjualan
 */
function getDemoHistoricalSales(): HistoricalSalesPoint[] {
  const points: HistoricalSalesPoint[] = [];
  const today = new Date();

  for (let i = 14; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const baseVal = 350000 + Math.floor(Math.random() * 200000);
    points.push({
      date: dateStr,
      sales_amount: baseVal,
      order_count: Math.floor(baseVal / 120000),
    });
  }

  return points;
}

/**
 * Fallback Master Data Local Events DIY & Jateng
 */
function getDemoLocalEvents(): LocalEventInput[] {
  return [
    {
      id: 'event-1',
      title: 'Dieng Culture Festival 2026',
      province_name: 'Jawa Tengah',
      city_name: 'Banjarnegara',
      start_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
      expected_tourist_impact: 'massive',
    },
    {
      id: 'event-2',
      title: 'Upacara Adat Sekaten Yogyakarta',
      province_name: 'DI Yogyakarta',
      city_name: 'Kota Yogyakarta',
      start_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 27 * 86400000).toISOString().split('T')[0],
      expected_tourist_impact: 'massive',
    },
    {
      id: 'event-3',
      title: 'Solo Batik Carnival',
      province_name: 'Jawa Tengah',
      city_name: 'Surakarta',
      start_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 47 * 86400000).toISOString().split('T')[0],
      expected_tourist_impact: 'high',
    }
  ];
}
