import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import {
  fillTimeSeriesGaps,
  determineConfidenceLevel,
  holtWintersForecast,
  simpleMovingAverageForecast,
  applyEventOverlay,
  generateAutoInsight,
  calculateBusyAndQuietDays,
  generateDailyStockRecommendations,
  DailySalesPoint,
  ForecastPoint,
  ForecastHorizon,
  LocalEventInput,
  SalesForecastResult,
  HoltWintersParams,
} from '@/lib/forecast/holtWinters';
import { backtest } from '@/lib/forecast/backtesting';

// Default params sebelum kalibrasi manual
const DEFAULT_PARAMS: HoltWintersParams = { alpha: 0.3, beta: 0.1, gamma: 0.3 };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const horizonParam = (searchParams.get('horizon') || '7_days') as ForecastHorizon;
    const businessIdParam = searchParams.get('businessId');
    const horizonDays = horizonParam === '15_days' ? 15 : 7;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let businessId: string | null = businessIdParam || null;

    // Cari business yang dimiliki user jika businessId tidak disertakan
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

      // Fallback: Jika user belum punya toko / belum login, ambil toko pertama dari database
      if (!businessId) {
        const { data: firstBiz } = await supabase
          .from('businesses')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (firstBiz) businessId = firstBiz.id;
      }
    }

    // =========================================================================
    // 1. Fetch & Agregasi Data Historis Transaksi dari Supabase
    // =========================================================================
    let rawHistorical: DailySalesPoint[] = [];

    if (businessId) {
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - 90);

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('business_id', businessId)
        .eq('order_status', 'completed')
        .eq('payment_status', 'paid')
        .gte('created_at', lookbackDate.toISOString())
        .order('created_at', { ascending: true });

      if (orders && orders.length > 0) {
        // Agregasi per tanggal
        const dateGroupMap = new Map<string, { total: number; count: number }>();
        for (const o of orders) {
          const dateStr = new Date(o.created_at).toISOString().split('T')[0];
          if (!dateGroupMap.has(dateStr)) {
            dateGroupMap.set(dateStr, { total: 0, count: 0 });
          }
          const curr = dateGroupMap.get(dateStr)!;
          curr.total += Number(o.total_amount || 0);
          curr.count += 1;
        }

        rawHistorical = Array.from(dateGroupMap.entries()).map(([date, val]) => ({
          date,
          sales_amount: val.total,
          order_count: val.count,
        }));
      }
    }

    // =========================================================================
    // 2. Time Series Pre-processing: Isi gap hari kosong = 0
    // =========================================================================
    const dataDaysAvailable = rawHistorical.length;
    const windowDays = Math.max(dataDaysAvailable, 14); // Minimal window 14 hari
    const filledSeries = dataDaysAvailable > 0
      ? fillTimeSeriesGaps(rawHistorical, windowDays)
      : [];

    const salesValues = filledSeries.map(p => p.sales_amount);
    const orderValues = filledSeries.map(p => p.order_count);
    const confidenceLevel = determineConfidenceLevel(filledSeries.length);
    const isFallbackMode = filledSeries.length < 14;

    // =========================================================================
    // 3. Jalankan Model Forecast (Holt-Winters atau MA Fallback)
    // =========================================================================
    let salesPredictions: number[] = [];
    let orderPredictions: number[] = [];
    let activeParams = DEFAULT_PARAMS;

    // Cek apakah ada tuned params tersimpan (dari kalibrasi manual sebelumnya)
    if (businessId) {
      const { data: savedParams } = await supabase
        .from('sales_forecasts')
        .select('forecast_data')
        .eq('business_id', businessId)
        .eq('forecast_type', 'tuned_params')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (savedParams?.forecast_data) {
        try {
          const parsed = savedParams.forecast_data as Record<string, unknown>;
          if (parsed.alpha && parsed.beta && parsed.gamma) {
            activeParams = {
              alpha: parsed.alpha as number,
              beta: parsed.beta as number,
              gamma: parsed.gamma as number,
            };
          }
        } catch { /* gunakan default */ }
      }
    }

    if (!isFallbackMode && salesValues.length >= 14) {
      const salesResult = holtWintersForecast(salesValues, activeParams, horizonDays);
      salesPredictions = salesResult.predictions;

      const orderResult = holtWintersForecast(orderValues, activeParams, horizonDays);
      orderPredictions = orderResult.predictions;
    } else {
      const salesResult = simpleMovingAverageForecast(salesValues, horizonDays);
      salesPredictions = salesResult.predictions;

      const orderResult = simpleMovingAverageForecast(orderValues, horizonDays);
      orderPredictions = orderResult.predictions;
    }

    // =========================================================================
    // 4. Backtesting: MAPE Validated (Out-of-Sample)
    // =========================================================================
    let mapeValidated = 100;
    let mapeInterpretation = 'Perlu Data Lebih';

    if (!isFallbackMode && salesValues.length >= 28) {
      const backtestResult = backtest(salesValues, activeParams, horizonDays);
      mapeValidated = Math.round(backtestResult.mapeValidated * 10) / 10;

      if (mapeValidated <= 15) mapeInterpretation = 'Sangat Baik';
      else if (mapeValidated <= 25) mapeInterpretation = 'Baik';
      else if (mapeValidated <= 40) mapeInterpretation = 'Cukup';
      else mapeInterpretation = 'Perlu Kalibrasi';
    } else if (!isFallbackMode) {
      // Data 14-27 hari: lakukan backtest dengan fold=1
      const backtestResult = backtest(salesValues, activeParams, horizonDays, 1);
      mapeValidated = Math.round(backtestResult.mapeValidated * 10) / 10;
      if (mapeValidated <= 25) mapeInterpretation = 'Baik';
      else mapeInterpretation = 'Cukup';
    }

    // =========================================================================
    // 5. Bangun Forecast Points + Event Overlay
    // =========================================================================
    const today = new Date();
    let forecastPoints: ForecastPoint[] = salesPredictions.map((val, i) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i + 1);
      const predictedSales = Math.round(Math.max(val, 0));
      const predictedOrders = Math.max(1, Math.round(orderPredictions[i] || (predictedSales > 0 ? Math.round(predictedSales / 150000) : 0)));

      // Confidence band berdasarkan MAPE
      const errorMargin = Math.max(mapeValidated / 100, 0.12);
      const lower = Math.round(predictedSales * (1 - errorMargin));
      const upper = Math.round(predictedSales * (1 + errorMargin));

      const ordersLower = Math.max(0, Math.round(predictedOrders * (1 - errorMargin)));
      const ordersUpper = Math.round(predictedOrders * (1 + errorMargin));

      return {
        date: targetDate.toISOString().split('T')[0],
        is_projected: true,
        predicted_sales: predictedSales,
        confidence_lower: Math.max(lower, 0),
        confidence_upper: upper,
        predicted_orders: predictedOrders,
        orders_confidence_lower: ordersLower,
        orders_confidence_upper: ordersUpper,
      };
    });

    // Fetch local events & apply overlay
    let localEvents: LocalEventInput[] = [];
    const { data: eventsData } = await supabase
      .from('local_events')
      .select('id, title, province_name, city_name, start_date, end_date, expected_tourist_impact, description')
      .order('start_date', { ascending: true });

    if (eventsData && eventsData.length > 0) {
      localEvents = eventsData.map((e: Record<string, unknown>) => ({
        id: e.id as string,
        title: e.title as string,
        province_name: e.province_name as string,
        city_name: (e.city_name as string | null) || null,
        start_date: e.start_date as string,
        end_date: e.end_date as string,
        expected_tourist_impact: (e.expected_tourist_impact as 'low' | 'medium' | 'high' | 'massive') || 'medium',
        description: (e.description as string | null) || null,
      }));
    }

    forecastPoints = applyEventOverlay(forecastPoints, localEvents);

    // =========================================================================
    // 6. Hitung Ringkasan (Omzet, Orders, Hari Ramai/Sepi, Rekomendasi Stok)
    // =========================================================================
    const totalProjectedRevenue = forecastPoints.reduce((sum, p) => sum + p.predicted_sales, 0);
    const totalProjectedOrders = forecastPoints.reduce((sum, p) => sum + p.predicted_orders, 0);
    
    const historicalRecent = filledSeries.slice(-horizonDays);
    const recentTotal = historicalRecent.reduce((sum, p) => sum + p.sales_amount, 0);
    const growth = recentTotal > 0
      ? Number((((totalProjectedRevenue - recentTotal) / recentTotal) * 100).toFixed(1))
      : 0;

    const { busySummary, quietSummary } = calculateBusyAndQuietDays(forecastPoints, filledSeries);
    const dailyStockRecommendations = generateDailyStockRecommendations(forecastPoints, filledSeries, localEvents);

    // =========================================================================
    // 7. Auto Insight + Gemini AI Narrative
    // =========================================================================
    const autoInsight = generateAutoInsight(filledSeries, forecastPoints, horizonParam);
    const aiNarrative = await generateAiStrategicNarrative(
      totalProjectedRevenue,
      growth,
      busySummary,
      quietSummary,
      localEvents,
      isFallbackMode
    );

    // =========================================================================
    // 8. Response Final
    // =========================================================================
    const response: SalesForecastResult = {
      horizon: horizonParam,
      confidence_level: confidenceLevel,
      data_days_available: filledSeries.length,
      is_fallback_mode: isFallbackMode,
      accuracy: {
        mape_validated: mapeValidated,
        mape_interpretation: mapeInterpretation,
      },
      historical_data: filledSeries,
      forecast_data: forecastPoints,
      total_projected_revenue: totalProjectedRevenue,
      total_projected_orders: totalProjectedOrders,
      growth_percentage: growth,
      busy_summary: busySummary,
      quiet_summary: quietSummary,
      daily_stock_recommendations: dailyStockRecommendations,
      auto_insight: autoInsight,
      ai_qualitative_note: aiNarrative,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating Sales Forecast API:', error);
    return NextResponse.json({ error: 'Gagal membuat kalkulasi prediksi penjualan' }, { status: 500 });
  }
}

const INDO_MONTHS_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatIndoDateRange(startDateStr: string, endDateStr: string): string {
  const s = new Date(startDateStr);
  const e = new Date(endDateStr);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${INDO_MONTHS_NAMES[e.getMonth()]} ${e.getFullYear()}`;
  }
  return `${s.getDate()} ${INDO_MONTHS_NAMES[s.getMonth()]} – ${e.getDate()} ${INDO_MONTHS_NAMES[e.getMonth()]} ${e.getFullYear()}`;
}

/**
 * Panggilan ke Google Gemini API untuk analisis naratif kualitatif strategis
 */
async function generateAiStrategicNarrative(
  totalProjected: number,
  growth: number,
  busySummary: { count: number; days_label: string },
  quietSummary: { count: number; days_label: string },
  events: LocalEventInput[],
  isFallback: boolean
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const formattedRevenue = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalProjected);

  // Format detail event daerah dengan tanggal spesifik
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
    fallbackEventNote = ` Terdapat event "${firstEv.title}" pada tanggal ${dateRange} di ${loc}. Segera siapkan stok produk unggulan & oleh-oleh untuk menyambut lonjakan wisatawan!`;
  }

  if (!apiKey) {
    return `Omzet diprediksi mencapai ${formattedRevenue} (${growth >= 0 ? '+' : ''}${growth}% vs periode lalu). Hari ramai diperkirakan pada (${busySummary.days_label}), sementara hari sepi pada (${quietSummary.days_label}). Kurangi belanja stok bahan segar pada hari sepi untuk efisiensi modal, dan perbanyak stok siap jual saat hari ramai.${fallbackEventNote}`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

    const promptText = `
Anda adalah Asisten Bisnis AI Khusus UMKM (Batik, Kuliner, Oleh-oleh, Kerajinan) di Daerah Istimewa Yogyakarta & Jawa Tengah.

Berikut data ringkasan proyeksi toko:
- Total Proyeksi Omzet: ${formattedRevenue} (${growth >= 0 ? '+' : ''}${growth}% vs periode lalu)
- Hari Diprediksi Ramai (${busySummary.count} hari): ${busySummary.days_label}
- Hari Diprediksi Sepi (${quietSummary.count} hari): ${quietSummary.days_label}
- Event Kebudayaan/Pariwisata Daerah DIY-Jateng:
${eventsFormattedList || 'Tidak ada event khusus dalam periode ini'}
- Status Data: ${isFallback ? 'Histori awal (Cold Start)' : 'Histori matang (Holt-Winters)'}

Instruksi Penting:
Buat 1 paragraf ringkas (3-4 kalimat) bergaya lugas, ramah, dan solutif:
1. Sebutkan perkiraan omzet serta hari puncak dan hari sepi.
2. Berikan instruksi konkret terkait alokasi modal dan persiapan stok bahan baku.
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
        if (response.text) return response.text;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Forecast AI: Model ${model} failed, trying next candidate...`, errMsg);
      }
    }

    return `Omzet diprediksi mencapai ${formattedRevenue} (${growth >= 0 ? '+' : ''}${growth}%). Tambah stok produk unggulan saat hari ramai (${busySummary.days_label}) dan tekan belanja bahan segar pada hari sepi (${quietSummary.days_label}).${fallbackEventNote}`;
  } catch (err) {
    console.warn('Gemini API call fallback:', err);
    return `Omzet diprediksi mencapai ${formattedRevenue} (${growth >= 0 ? '+' : ''}${growth}%). Tambah stok produk unggulan saat hari ramai (${busySummary.days_label}) dan tekan belanja bahan baku segar pada hari sepi (${quietSummary.days_label}) untuk efisiensi modal kas.${fallbackEventNote}`;
  }
}
