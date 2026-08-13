'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShieldCheck,
  Settings2,
  X,
  MapPin,
  Loader2,
  Info,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { SalesForecastResult, ForecastHorizon, ForecastPoint } from '@/lib/forecast/holtWinters';

export default function SalesForecastPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>('7_days');
  const [data, setData] = useState<SalesForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrateResult, setCalibrateResult] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ForecastPoint['associated_event'] | null>(null);

  const fetchForecast = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forecast?horizon=${horizon}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
    }
  }, [horizon]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const handleCalibrate = async () => {
    if (calibrating) return;
    setCalibrating(true);
    setCalibrateResult(null);

    try {
      const res = await fetch('/api/forecast/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon }),
      });
      const json = await res.json();

      if (json.success) {
        setCalibrateResult(
          `✅ Kalibrasi berhasil! α=${json.tuned_params.alpha}, β=${json.tuned_params.beta}, γ=${json.tuned_params.gamma} — MAPE: ${json.mape_validated}% (${json.mape_interpretation})`
        );
        // Refresh forecast dengan parameter baru
        await fetchForecast();
      } else {
        setCalibrateResult(`⚠️ ${json.error}`);
      }
    } catch (err) {
      setCalibrateResult('❌ Gagal menghubungi server kalibrasi.');
    } finally {
      setCalibrating(false);
    }
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Format data untuk Recharts
  const chartData = data
    ? [
        ...data.historical_data.map((p) => ({
          date: p.date.slice(5), // MM-DD
          historical_sales: p.sales_amount,
          predicted_sales: null as number | null,
          confidence_range: null as [number, number] | null,
          event: null as ForecastPoint['associated_event'] | null,
        })),
        ...data.forecast_data.map((p) => ({
          date: p.date.slice(5),
          historical_sales: null as number | null,
          predicted_sales: p.predicted_sales,
          confidence_range: [p.confidence_lower, p.confidence_upper] as [number, number],
          event: p.associated_event || null,
        })),
      ]
    : [];

  // MAPE badge color
  const getMapeColor = (mape: number) => {
    if (mape <= 15) return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' };
    if (mape <= 25) return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' };
    return { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-700' };
  };

  // Confidence badge color
  const getConfidenceColor = (level: string) => {
    if (level === 'high') return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' };
    if (level === 'medium') return { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' };
    return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          Menghitung Prediksi Holt-Winters &amp; Narasi AI Gemini...
        </p>
      </div>
    );
  }

  const mapeColor = getMapeColor(data?.accuracy?.mape_validated || 100);
  const confColor = getConfidenceColor(data?.confidence_level || 'low');
  const isGrowthPositive = (data?.growth_percentage || 0) >= 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sales Forecast
            </h1>
            {data?.is_fallback_mode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                <AlertCircle className="w-3.5 h-3.5" />
                Cold-Start Mode (Moving Average)
              </span>
            )}
            {!data?.is_fallback_mode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700">
                <TrendingUp className="w-3.5 h-3.5" />
                Holt-Winters Triple Exponential Smoothing
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {data?.is_fallback_mode
              ? `Data masih ${data.data_days_available} hari. Prediksi menggunakan rata-rata sederhana. Kumpulkan minimal 14 hari data untuk aktivasi Holt-Winters.`
              : `Proyeksi penjualan berbasis ${data?.data_days_available || 0} hari data historis, siklus musiman 7 hari, dan overlay event daerah DIY-Jateng.`}
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setHorizon('7_days')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                horizon === '7_days'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Hari Ke Depan
            </button>
            <button
              onClick={() => setHorizon('15_days')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                horizon === '15_days'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              15 Hari Ke Depan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projected Revenue */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Omzet Proyeksi</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {formatIDR(data?.total_projected_revenue || 0)}
            </span>
          </div>
        </div>

        {/* Growth */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyeksi Pertumbuhan</span>
            <div className={`p-2 rounded-xl ${isGrowthPositive ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'}`}>
              {isGrowthPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-bold ${isGrowthPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isGrowthPositive ? '+' : ''}{data?.growth_percentage || 0}%
            </span>
            <span className="text-xs text-slate-500 ml-2">vs Periode Lalu</span>
          </div>
        </div>

        {/* MAPE Accuracy */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Akurasi Model (MAPE)</span>
            <div className={`p-2 rounded-xl ${mapeColor.bg} ${mapeColor.text}`}>
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${mapeColor.text}`}>
              {data?.accuracy?.mape_validated?.toFixed(1) || '—'}%
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mapeColor.bg} ${mapeColor.text} ${mapeColor.border} border`}>
              {data?.accuracy?.mape_interpretation || 'N/A'}
            </span>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Level</span>
            <div className={`p-2 rounded-xl ${confColor.bg} ${confColor.text}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-bold uppercase ${confColor.text}`}>
              {data?.confidence_level || 'low'}
            </span>
            <span className="text-xs text-slate-500">
              ({data?.data_days_available || 0} hari data)
            </span>
          </div>
        </div>
      </div>

      {/* Calibrate Button + Result */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          onClick={handleCalibrate}
          disabled={calibrating || (data?.is_fallback_mode ?? true)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            data?.is_fallback_mode
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md'
          }`}
          title={data?.is_fallback_mode ? 'Butuh minimal 14 hari data untuk kalibrasi' : 'Jalankan Grid Search 64 kombinasi α/β/γ'}
        >
          {calibrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
          {calibrating ? 'Mengkalibrasi (64 kombinasi)...' : '🔧 Kalibrasi Model'}
        </button>

        {data?.is_fallback_mode && (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <Info className="w-3.5 h-3.5" />
            Butuh min. 14 hari data untuk mengaktifkan kalibrasi Holt-Winters.
          </span>
        )}

        {calibrateResult && (
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            {calibrateResult}
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Kurva Proyeksi Penjualan &amp; Confidence Interval
          </h2>
          <p className="text-xs text-slate-500">
            Area shading menggambarkan batas probabilitas berdasarkan MAPE validated ({data?.accuracy?.mape_validated?.toFixed(1) || 0}%).
          </p>
        </div>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any, name: any) => {
                  if (!val) return ['Rp 0', ''];
                  if (Array.isArray(val)) return [`${formatIDR(val[0])} — ${formatIDR(val[1])}`, 'Confidence Band'];
                  if (name === 'historical_sales') return [formatIDR(val), 'Penjualan Historis'];
                  return [formatIDR(val), 'Proyeksi Penjualan'];
                }}
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="confidence_range"
                fill="url(#confidenceGradient)"
                stroke="#D97706"
                strokeDasharray="2 2"
                name="Confidence Band"
              />
              <Line
                type="monotone"
                dataKey="historical_sales"
                stroke="#1E293B"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Histori Transaksi"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted_sales"
                stroke="#D97706"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={(props: Record<string, unknown>) => {
                  const cx = props.cx as number;
                  const cy = props.cy as number;
                  const payload = props.payload as { event?: ForecastPoint['associated_event'] };
                  if (payload?.event) {
                    return (
                      <circle
                        key={`event-${cx}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#F59E0B"
                        stroke="#FFF"
                        strokeWidth={2}
                        className="cursor-pointer animate-pulse"
                        onClick={() => setSelectedEvent(payload.event)}
                      />
                    );
                  }
                  return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3} fill="#D97706" />;
                }}
                name="Proyeksi Penjualan"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auto Insight + AI Strategic Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto Insight (Data-Driven) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insight Otomatis</h3>
              <p className="text-xs text-slate-500">Berdasarkan analisis data kuantitatif</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data?.auto_insight || 'Data tidak cukup untuk menghasilkan insight.'}
          </p>
        </div>

        {/* AI Strategic Narrative (Gemini) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/50 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rekomendasi Strategis Gemini AI</h3>
              <p className="text-xs text-indigo-300">Interpretasi kualitatif berbasis statistik &amp; kalender wisata</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-sm leading-relaxed text-indigo-100">
            {data?.ai_qualitative_note || 'Proyeksi omzet periode ini siap meningkat. Pantau ketersediaan stok produk unggulan Anda.'}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{selectedEvent.city_name || ''}, {selectedEvent.province_name}</span>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-300 dark:border-amber-800 rounded-xl">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Estimasi Dampak Wisatawan: {selectedEvent.impact.toUpperCase()}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Lonjakan permintaan diperkirakan meningkat hingga{' '}
                  {selectedEvent.impact === 'massive' ? '+75%' : selectedEvent.impact === 'high' ? '+45%' : selectedEvent.impact === 'medium' ? '+25%' : '+10%'}.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
