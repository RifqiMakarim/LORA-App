'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Info, 
  MapPin, 
  ArrowUpRight, 
  DollarSign, 
  AlertCircle,
  HelpCircle,
  X
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
  Legend 
} from 'recharts';
import { SalesForecastResult, ForecastHorizon, ForecastPoint } from '@/lib/engines/predictive-forecast';

export default function SalesForecastPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>('30_days_daily');
  const [data, setData] = useState<SalesForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ForecastPoint['associated_event'] | null>(null);

  useEffect(() => {
    async function fetchForecastData() {
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
    }
    fetchForecastData();
  }, [horizon]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Format data untuk Recharts ComposedChart
  const chartData = data ? [
    ...data.historical_data.map(p => ({
      date: p.date,
      historical_sales: p.sales_amount,
      predicted_sales: null,
      confidence_range: null,
      event: null,
    })),
    ...data.forecast_data.map(p => ({
      date: p.date,
      historical_sales: null,
      predicted_sales: p.predicted_sales,
      confidence_range: [p.confidence_lower, p.confidence_upper],
      event: p.associated_event || null,
    }))
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          Menghitung Prediksi Holt-Winters & Narasi AI Gemini...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hybrid Sales Forecast
            </h1>
            {data?.is_cold_start && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                <AlertCircle className="w-3.5 h-3.5" />
                Estimasi Awal Kategori (Cold-Start)
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Proyeksi penjualan matematik 95% Confidence Interval berbasis tren & agenda event kebudayaan DIY-Jateng.
          </p>
        </div>

        {/* Horizon Toggle Switcher */}
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setHorizon('30_days_daily')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              horizon === '30_days_daily'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            30 Hari Harian
          </button>
          <button
            onClick={() => setHorizon('12_weeks_weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              horizon === '12_weeks_weekly'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            12 Minggu Mingguan
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Total Omzet Proyeksi</span>
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

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyeksi Pertumbuhan</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              +{data?.growth_percentage || 0}%
            </span>
            <span className="text-xs text-slate-500 ml-2">vs Periode Lalu</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Regional Terdeteksi</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {data?.forecast_data.filter(f => f.associated_event).length || 0}
            </span>
            <span className="text-xs text-slate-500 ml-2">Event DIY & Jateng</span>
          </div>
        </div>
      </div>

      {/* Main Combined Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Kurva Proyeksi Penjualan & 95% Confidence Interval
            </h2>
            <p className="text-xs text-slate-500">
              Area berwarna shading menggambarkan batas atas & batas bawah probabilitas statistik 95%.
            </p>
          </div>
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
                tickFormatter={(v) => `Rp ${v / 1000}k`} 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
              />
              <Tooltip 
                formatter={(val: any, name: any) => {
                  if (Array.isArray(val)) return [`${formatIDR(val[0])} - ${formatIDR(val[1])}`, 'Batas Probabilitas 95%'];
                  if (name === 'historical_sales') return [formatIDR(val), 'Penjualan Historis'];
                  return [formatIDR(val), 'Proyeksi Penjualan AI'];
                }}
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }}
              />
              <Legend />
              {/* Confidence Interval Band */}
              <Area 
                type="monotone" 
                dataKey="confidence_range" 
                fill="url(#confidenceGradient)" 
                stroke="#D97706" 
                strokeDasharray="2 2"
                name="Confidence Interval 95%" 
              />
              {/* Historical Line */}
              <Line 
                type="monotone" 
                dataKey="historical_sales" 
                stroke="#1E293B" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
                name="Histori Transaksi" 
              />
              {/* Forecast Line */}
              <Line 
                type="monotone" 
                dataKey="predicted_sales" 
                stroke="#D97706" 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload && payload.event) {
                    return (
                      <circle
                        key={cx}
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
                  return <circle key={cx} cx={cx} cy={cy} r={3} fill="#D97706" />;
                }}
                name="Proyeksi Penjualan" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Strategic Qualitative Insight Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-4 border border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Analisis Naratif Strategis Gemini AI</h3>
            <p className="text-xs text-indigo-300">Interpretasi kualitatif berbasis gabungan statistik & kalender wisata lokal</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-sm leading-relaxed text-indigo-100">
          {data?.ai_qualitative_note || 'Proyeksi omzet periode ini siap meningkat. Pantau ketersediaan stok produk unggulan Anda.'}
        </div>
      </div>

      {/* EVENT POPOVER MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in duration-200">
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
                  Lonjakan permintaan diperkirakan meningkat hingga {selectedEvent.impact === 'massive' ? '+75%' : '+45%'}.
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
