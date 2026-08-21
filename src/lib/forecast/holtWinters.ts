export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ForecastHorizon = '7_days' | '15_days';

export interface DailySalesPoint {
  date: string;       // YYYY-MM-DD
  sales_amount: number;
  order_count: number;
}

export interface HoltWintersParams {
  alpha: number;  // level smoothing (0-1)
  beta: number;   // trend smoothing (0-1)
  gamma: number;  // seasonal smoothing (0-1)
}

export interface AssociatedEventInfo {
  id: string;
  title: string;
  province_name: string;
  city_name?: string | null;
  impact: 'low' | 'medium' | 'high' | 'massive';
}

export interface ForecastPoint {
  date: string;
  is_projected: boolean;
  predicted_sales: number;
  confidence_lower: number;
  confidence_upper: number;
  predicted_orders: number;
  orders_confidence_lower: number;
  orders_confidence_upper: number;
  associated_event?: AssociatedEventInfo;
}

export interface LocalEventInput {
  id: string;
  title: string;
  province_name: string;
  city_name?: string | null;
  start_date: string;
  end_date: string;
  expected_tourist_impact: 'low' | 'medium' | 'high' | 'massive';
  description?: string | null;
}

export interface DailyStockRecommendation {
  date: string;
  day_label: string; // e.g. "Jumat, 20 Agustus"
  status: 'busy' | 'quiet' | 'normal';
  percentage_diff: number; // e.g. +28 or -35
  action_text: string;
  associated_event?: AssociatedEventInfo;
}

export interface DaysClassificationSummary {
  count: number;
  days_label: string; // e.g. "Jum 20, Sen 23, Sel 24 (+2 lainnya)"
  days_list: string[];
}

export interface SalesForecastResult {
  horizon: ForecastHorizon;
  confidence_level: ConfidenceLevel;
  data_days_available: number;
  is_fallback_mode: boolean;
  accuracy: {
    mape_validated: number;
    mape_interpretation: string;  // "Baik" / "Cukup" / "Perlu Data Lebih"
  };
  tuned_params?: HoltWintersParams & { tuned_at: string };
  historical_data: DailySalesPoint[];
  forecast_data: ForecastPoint[];
  total_projected_revenue: number;
  total_projected_orders: number;
  growth_percentage: number;
  busy_summary: DaysClassificationSummary;
  quiet_summary: DaysClassificationSummary;
  daily_stock_recommendations: DailyStockRecommendation[];
  auto_insight: string;
  ai_qualitative_note?: string;
}

export function fillTimeSeriesGaps(rawData: DailySalesPoint[], windowDays: number): DailySalesPoint[] {
  if (rawData.length === 0) return [];

  // Sort by date ascending
  const sorted = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const endDate = new Date(sorted[sorted.length - 1].date);
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - windowDays + 1);

  const dataMap = new Map<string, DailySalesPoint>();
  for (const p of sorted) {
    dataMap.set(p.date, p);
  }

  const result: DailySalesPoint[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (dataMap.has(dateStr)) {
      result.push(dataMap.get(dateStr)!);
    } else {
      result.push({
        date: dateStr,
        sales_amount: 0,
        order_count: 0
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function determineConfidenceLevel(dataDays: number): ConfidenceLevel {
  if (dataDays < 14) return 'low';
  if (dataDays <= 27) return 'medium';
  return 'high';
}

/**
 * Holt-Winters Additive Method dengan Seasonality = 7 hari
 */
export function holtWintersForecast(
  series: number[], 
  params: HoltWintersParams, 
  horizon: number, 
  seasonLength: number = 7
): { predictions: number[]; fittedValues: number[] } {
  const n = series.length;
  if (n < 2 * seasonLength) {
    return { predictions: [], fittedValues: [] };
  }

  // 1. Inisialisasi Level
  let level = 0;
  for (let i = 0; i < seasonLength; i++) {
    level += series[i];
  }
  level /= seasonLength;

  // 2. Inisialisasi Trend
  let trend = 0;
  for (let i = 0; i < seasonLength; i++) {
    trend += (series[i + seasonLength] - series[i]) / seasonLength;
  }
  trend /= seasonLength;

  // 3. Inisialisasi Musiman
  const seasonals = new Array(seasonLength).fill(0);
  for (let i = 0; i < seasonLength; i++) {
    seasonals[i] = series[i] - level;
  }

  const fittedValues: number[] = new Array(n).fill(0);
  for (let i = 0; i < seasonLength; i++) {
      fittedValues[i] = series[i]; 
  }

  let L = level;
  let T = trend;
  const currentSeasonals = [...seasonals];

  // 4. Update Equations (Filtering loop)
  for (let i = seasonLength; i < n; i++) {
    const y = series[i];
    const sIdx = i % seasonLength;
    
    fittedValues[i] = L + T + currentSeasonals[sIdx];
    
    const L_prev = L;
    const T_prev = T;
    
    L = params.alpha * (y - currentSeasonals[sIdx]) + (1 - params.alpha) * (L_prev + T_prev);
    T = params.beta * (L - L_prev) + (1 - params.beta) * T_prev;
    currentSeasonals[sIdx] = params.gamma * (y - L) + (1 - params.gamma) * currentSeasonals[sIdx];
  }

  // 5. Forecast Equation (h steps ahead)
  const predictions: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const sIdx = (n - 1 + h) % seasonLength;
    const pred = L + h * T + currentSeasonals[sIdx];
    predictions.push(Math.max(0, pred));
  }

  return { predictions, fittedValues };
}

/**
 * Fallback Cold-Start: Moving Average Sederhana
 */
export function simpleMovingAverageForecast(series: number[], horizon: number): { predictions: number[]; fittedValues: number[] } {
  if (series.length === 0) {
    return { predictions: new Array(horizon).fill(0), fittedValues: [] };
  }
  
  const sum = series.reduce((a, b) => a + b, 0);
  const avg = sum / series.length;
  
  const fittedValues = series.map(() => avg);
  const predictions = new Array(horizon).fill(avg);
  
  return { predictions, fittedValues };
}

/**
 * Menerapkan dampak event wisata lokal DIY-Jateng
 */
export function applyEventOverlay(forecastPoints: ForecastPoint[], localEvents: LocalEventInput[]): ForecastPoint[] {
  const result: ForecastPoint[] = forecastPoints.map(p => ({ ...p, associated_event: undefined }));

  for (const point of result) {
    const pointDate = new Date(point.date);
    
    for (const event of localEvents) {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      
      if (pointDate >= start && pointDate <= end) {
        let multiplier = 1;
        switch (event.expected_tourist_impact) {
          case 'low': multiplier = 1.10; break;
          case 'medium': multiplier = 1.25; break;
          case 'high': multiplier = 1.45; break;
          case 'massive': multiplier = 1.75; break;
        }

        point.predicted_sales = Math.round(point.predicted_sales * multiplier);
        point.confidence_lower = Math.round(point.confidence_lower * multiplier);
        point.confidence_upper = Math.round(point.confidence_upper * multiplier);
        
        point.predicted_orders = Math.round(point.predicted_orders * multiplier);
        point.orders_confidence_lower = Math.round(point.orders_confidence_lower * multiplier);
        point.orders_confidence_upper = Math.round(point.orders_confidence_upper * multiplier);

        point.associated_event = {
          id: event.id,
          title: event.title,
          province_name: event.province_name,
          city_name: event.city_name,
          impact: event.expected_tourist_impact
        };
        break; 
      }
    }
  }

  return result;
}

const INDO_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDO_DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Mengelompokkan hari ramai dan hari sepi
 */
export function calculateBusyAndQuietDays(
  forecastPoints: ForecastPoint[],
  historicalData: DailySalesPoint[]
): {
  busySummary: DaysClassificationSummary;
  quietSummary: DaysClassificationSummary;
} {
  if (forecastPoints.length === 0) {
    return {
      busySummary: { count: 0, days_label: '—', days_list: [] },
      quietSummary: { count: 0, days_label: '—', days_list: [] },
    };
  }

  // Hitung baseline rata-rata dari histori 14 hari terakhir atau forecast
  const recentHist = historicalData.slice(-14);
  const histAvg = recentHist.length > 0 
    ? recentHist.reduce((s, p) => s + p.sales_amount, 0) / recentHist.length 
    : 0;
  
  const forecastAvg = forecastPoints.reduce((s, p) => s + p.predicted_sales, 0) / forecastPoints.length;
  const baseline = histAvg > 0 ? (histAvg * 0.4 + forecastAvg * 0.6) : forecastAvg;

  const busyList: string[] = [];
  const quietList: string[] = [];

  for (const p of forecastPoints) {
    const d = new Date(p.date);
    const dayName = INDO_DAYS_SHORT[d.getDay()];
    const dayDate = d.getDate();
    const formatted = `${dayName} ${dayDate}`;

    const diff = baseline > 0 ? (p.predicted_sales - baseline) / baseline : 0;

    if (diff >= 0.10 || (p.associated_event && p.associated_event.impact !== 'low')) {
      busyList.push(formatted);
    } else if (diff <= -0.10) {
      quietList.push(formatted);
    }
  }

  const formatPills = (list: string[]) => {
    if (list.length === 0) return 'Tidak ada';
    if (list.length <= 3) return list.join(', ');
    return `${list.slice(0, 3).join(', ')}, +${list.length - 3} lainnya`;
  };

  return {
    busySummary: {
      count: busyList.length,
      days_label: formatPills(busyList),
      days_list: busyList,
    },
    quietSummary: {
      count: quietList.length,
      days_label: formatPills(quietList),
      days_list: quietList,
    },
  };
}

/**
 * Menghasilkan kartu rekomendasi stok harian terintegrasi kalender event DIY-Jateng
 */
export function generateDailyStockRecommendations(
  forecastPoints: ForecastPoint[],
  historicalData: DailySalesPoint[],
  _localEvents: LocalEventInput[] = []
): DailyStockRecommendation[] {
  if (forecastPoints.length === 0) return [];

  const recentHist = historicalData.slice(-14);
  const histAvg = recentHist.length > 0 
    ? recentHist.reduce((s, p) => s + p.sales_amount, 0) / recentHist.length 
    : 0;
  const forecastAvg = forecastPoints.reduce((s, p) => s + p.predicted_sales, 0) / forecastPoints.length;
  const baseline = histAvg > 0 ? (histAvg * 0.4 + forecastAvg * 0.6) : forecastAvg;

  return forecastPoints.map((p) => {
    const d = new Date(p.date);
    const dayFullName = INDO_DAYS_FULL[d.getDay()];
    const dayDate = d.getDate();
    const monthName = INDO_MONTHS[d.getMonth()];
    const dayLabel = `${dayFullName}, ${dayDate} ${monthName}`;

    const diff = baseline > 0 ? ((p.predicted_sales - baseline) / baseline) * 100 : 0;
    const roundedDiff = Math.round(diff);

    let status: 'busy' | 'quiet' | 'normal' = 'normal';
    if (roundedDiff >= 10 || (p.associated_event && p.associated_event.impact !== 'low')) {
      status = 'busy';
    } else if (roundedDiff <= -10) {
      status = 'quiet';
    }

    // Buat saran stok yang actionable
    let actionText = '';
    if (p.associated_event) {
      const event = p.associated_event;
      const impactText = event.impact === 'massive' ? '+75%' : event.impact === 'high' ? '+45%' : '+25%';
      actionText = `🎪 Ada event "${event.title}" di ${event.city_name || event.province_name} (potensi lonjakan ${impactText}). Siapkan stok ekstra untuk produk unggulan & oleh-oleh siap bawa agar tidak kehabisan.`;
    } else if (status === 'busy') {
      actionText = `Siapkan stok bahan baku ekstra & produk siap kirim lebih awal supaya tidak kehabisan saat lonjakan pesanan.`;
    } else if (status === 'quiet') {
      actionText = `Kurangi belanja bahan baku segar/perishable dari biasanya agar tidak ada sisa terbuang dan menghemat modal kas.`;
    } else {
      actionText = `Pertahankan jumlah stok dan pasokan bahan baku sesuai operasional standar harian toko.`;
    }

    return {
      date: p.date,
      day_label: dayLabel,
      status,
      percentage_diff: roundedDiff,
      action_text: actionText,
      associated_event: p.associated_event,
    };
  });
}

/**
 * Auto-insight teks singkat kuantitatif
 */
export function generateAutoInsight(
  historicalData: DailySalesPoint[], 
  forecastData: ForecastPoint[], 
  horizon: ForecastHorizon
): string {
  if (historicalData.length === 0 || forecastData.length === 0) {
    return "Data tidak cukup untuk menghasilkan insight.";
  }

  const last14Days = historicalData.slice(-14);
  const histAvg = last14Days.reduce((sum, p) => sum + p.sales_amount, 0) / (last14Days.length || 1);
  const forecastAvg = forecastData.reduce((sum, p) => sum + p.predicted_sales, 0) / forecastData.length;

  let peakDay = forecastData[0];
  let lowestDay = forecastData[0];

  for (const p of forecastData) {
    if (p.predicted_sales > peakDay.predicted_sales) peakDay = p;
    if (p.predicted_sales < lowestDay.predicted_sales) lowestDay = p;
  }

  const peakDateObj = new Date(peakDay.date);
  const lowestDateObj = new Date(lowestDay.date);

  const peakDayName = `${INDO_DAYS_FULL[peakDateObj.getDay()]} (${peakDateObj.getDate()} ${INDO_MONTHS[peakDateObj.getMonth()]})`;
  const lowestDayName = `${INDO_DAYS_FULL[lowestDateObj.getDay()]} (${lowestDateObj.getDate()} ${INDO_MONTHS[lowestDateObj.getMonth()]})`;

  let trendText = "stabil";
  let diffPercent = 0;

  if (histAvg > 0) {
    diffPercent = Math.round((Math.abs(forecastAvg - histAvg) / histAvg) * 100);
    if (forecastAvg > histAvg) {
      trendText = `naik ${diffPercent}%`;
    } else if (forecastAvg < histAvg) {
      trendText = `turun ${diffPercent}%`;
    }
  } else {
    trendText = "naik signifikan (data historis baru)";
  }

  const horizonDays = horizon === '7_days' ? '7' : '15';

  // Deteksi event lokal pada data proyeksi
  const eventsFound = new Map<string, { title: string; dates: string[]; city?: string | null; province: string; impact: string }>();
  for (const p of forecastData) {
    if (p.associated_event) {
      const ev = p.associated_event;
      if (!eventsFound.has(ev.id)) {
        eventsFound.set(ev.id, {
          title: ev.title,
          dates: [p.date],
          city: ev.city_name,
          province: ev.province_name,
          impact: ev.impact,
        });
      } else {
        eventsFound.get(ev.id)!.dates.push(p.date);
      }
    }
  }

  let eventSentence = '';
  if (eventsFound.size > 0) {
    const eventDetails = Array.from(eventsFound.values()).map(ev => {
      const startObj = new Date(ev.dates[0]);
      const endObj = new Date(ev.dates[ev.dates.length - 1]);
      const startStr = `${startObj.getDate()} ${INDO_MONTHS[startObj.getMonth()]}`;
      const endStr = `${endObj.getDate()} ${INDO_MONTHS[endObj.getMonth()]} ${endObj.getFullYear()}`;
      const dateRange = ev.dates.length === 1 ? `${startStr} ${startObj.getFullYear()}` : `${startStr} - ${endStr}`;
      const impactText = ev.impact === 'massive' ? '+75%' : ev.impact === 'high' ? '+45%' : '+25%';
      const loc = ev.city ? `${ev.city}, ${ev.province}` : ev.province;
      return `"${ev.title}" pada tanggal ${dateRange} di ${loc} (potensi lonjakan wisatawan ${impactText})`;
    }).join('; ');
    eventSentence = ` Terdapat agenda kebudayaan daerah: ${eventDetails}. Segera siapkan tambahan persediaan produk unggulan Anda!`;
  }

  return `Prediksi ${horizonDays} hari ke depan diperkirakan ${trendText} dari rata-rata historis. Puncak omzet diprediksi pada hari ${peakDayName}, sementara titik terendah pada ${lowestDayName}.${eventSentence}`;
}
