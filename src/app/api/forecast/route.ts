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
    if (!businessId && user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      if (business) businessId = business.id;
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
    const confidenceLevel = determineConfidenceLevel(filledSeries.length);
    const isFallbackMode = filledSeries.length < 14;

    // =========================================================================
    // 3. Jalankan Model Forecast (Holt-Winters atau MA Fallback)
    // =========================================================================
    let predictions: number[] = [];
    let fittedValues: number[] = [];
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
      const result = holtWintersForecast(salesValues, activeParams, horizonDays);
      predictions = result.predictions;
      fittedValues = result.fittedValues;
    } else {
      const result = simpleMovingAverageForecast(salesValues, horizonDays);
      predictions = result.predictions;
      fittedValues = result.fittedValues;
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
    let forecastPoints: ForecastPoint[] = predictions.map((val, i) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i + 1);
      const predicted = Math.round(Math.max(val, 0));

      // Confidence band berdasarkan MAPE
      const errorMargin = Math.max(mapeValidated / 100, 0.10);
      const lower = Math.round(predicted * (1 - errorMargin));
      const upper = Math.round(predicted * (1 + errorMargin));

      return {
        date: targetDate.toISOString().split('T')[0],
        is_projected: true,
        predicted_sales: predicted,
        confidence_lower: Math.max(lower, 0),
        confidence_upper: upper,
      };
    });

    // Fetch local events & apply overlay
    let localEvents: LocalEventInput[] = [];
    const { data: eventsData } = await supabase
      .from('local_events')
      .select('id, title, province_name, city_name, start_date, end_date, expected_tourist_impact')
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
      }));
    }

    forecastPoints = applyEventOverlay(forecastPoints, localEvents);

    // =========================================================================
    // 6. Hitung Ringkasan
    // =========================================================================
    const totalProjected = forecastPoints.reduce((sum, p) => sum + p.predicted_sales, 0);
    const historicalRecent = filledSeries.slice(-horizonDays);
    const recentTotal = historicalRecent.reduce((sum, p) => sum + p.sales_amount, 0);
    const growth = recentTotal > 0
      ? Number((((totalProjected - recentTotal) / recentTotal) * 100).toFixed(1))
      : 0;

    // =========================================================================
    // 7. Auto Insight + Gemini AI Narrative
    // =========================================================================
    const autoInsight = generateAutoInsight(filledSeries, forecastPoints, horizonParam);
    const aiNarrative = await generateAiStrategicNarrative(totalProjected, growth, localEvents, isFallbackMode);

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
      total_projected_revenue: totalProjected,
      growth_percentage: growth,
      auto_insight: autoInsight,
      ai_qualitative_note: aiNarrative,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating Sales Forecast API:', error);
    return NextResponse.json({ error: 'Gagal membuat kalkulasi prediksi penjualan' }, { status: 500 });
  }
}

/**
 * Panggilan ke Google Gemini API untuk analisis naratif kualitatif strategis
 */
async function generateAiStrategicNarrative(
  totalProjected: number,
  growth: number,
  events: LocalEventInput[],
  isFallback: boolean
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const formattedRevenue = new Intl.NumberFormat('id-ID').format(totalProjected);

  if (!apiKey) {
    return `Berdasarkan proyeksi matematik, omzet Anda diprediksi mencapai Rp ${formattedRevenue} dengan pertumbuhan ${growth}%. Disarankan menambah stok 20% menjelang event kebudayaan daerah terdekat.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
Anda adalah Konsultan Bisnis AI Senior khusus UMKM sektor Batik, Kuliner, dan Kerajinan di Daerah Istimewa Yogyakarta & Jawa Tengah.

Berikut data proyeksi penjualan toko UMKM:
- Mode Prediksi: ${isFallback ? 'Fallback Moving Average (data masih sedikit)' : 'Holt-Winters Triple Exponential Smoothing'}
- Estimasi Total Proyeksi Omzet: Rp ${formattedRevenue}
- Est. Pertumbuhan: ${growth}%
- Event Kebudayaan/Pariwisata Terdekat: ${events.map(e => `${e.title} (${e.province_name}, ${e.start_date})`).join(', ') || 'Tidak ada event terdeteksi'}

Berikan 3 poin rekomendasi strategis konkret (persiapan stok, strategi harga/paket promosi, dan momentum event) yang singkat, padat, ramah, dan bernuansa lokal (max 3-4 kalimat).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
    });

    return response.text || `Proyeksi omzet periode ini mencapai Rp ${formattedRevenue}. Manfaatkan lonjakan wisatawan pada event daerah terdekat!`;
  } catch (err) {
    console.warn('Gemini API call fallback:', err);
    return `Proyeksi omzet periode ini mencapai Rp ${formattedRevenue} (pertumbuhan ${growth}%). Manfaatkan lonjakan wisatawan pada event daerah terdekat dengan menyiapkan produk terlaris!`;
  }
}
