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

export interface ForecastPoint {
  date: string;
  is_projected: boolean;
  predicted_sales: number;
  confidence_lower: number;
  confidence_upper: number;
  associated_event?: {
    id: string;
    title: string;
    province_name: string;
    city_name?: string | null;
    impact: 'low' | 'medium' | 'high' | 'massive';
  };
}

export interface LocalEventInput {
  id: string;
  title: string;
  province_name: string;
  city_name?: string | null;
  start_date: string;
  end_date: string;
  expected_tourist_impact: 'low' | 'medium' | 'high' | 'massive';
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
  growth_percentage: number;
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

  let level = 0;
  for (let i = 0; i < seasonLength; i++) {
    level += series[i];
  }
  level /= seasonLength;

  let trend = 0;
  for (let i = 0; i < seasonLength; i++) {
    trend += (series[i + seasonLength] - series[i]) / seasonLength;
  }
  trend /= seasonLength;

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

  const predictions: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const sIdx = (n - 1 + h) % seasonLength;
    let pred = L + h * T + currentSeasonals[sIdx];
    predictions.push(Math.max(0, pred));
  }

  return { predictions, fittedValues };
}

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

        point.predicted_sales *= multiplier;
        point.confidence_lower *= multiplier;
        point.confidence_upper *= multiplier;

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
  for (const p of forecastData) {
    if (p.predicted_sales > peakDay.predicted_sales) {
      peakDay = p;
    }
  }

  const dateObj = new Date(peakDay.date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const peakDayName = days[dateObj.getDay()];

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
    trendText = "naik signifikan (data historis nol)";
  }

  const horizonDays = horizon === '7_days' ? '7' : '15';

  return `Prediksi ${horizonDays} hari ke depan diperkirakan ${trendText} dari rata-rata ${last14Days.length} hari terakhir. Puncak penjualan diperkirakan pada hari ${peakDayName}.`;
}
