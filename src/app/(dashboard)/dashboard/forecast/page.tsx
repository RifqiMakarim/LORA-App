'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  ShoppingBag,
  RotateCcw,
  MapPin,
  Info,
  X,
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
  LabelList,
} from 'recharts';
import type {
  SalesForecastResult,
  ForecastHorizon,
  ForecastPoint,
  LocalEventInput,
} from '@/lib/forecast/holtWinters';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';

export default function SalesForecastPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>('7_days');
  const [data, setData] = useState<SalesForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrateResult, setCalibrateResult] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ForecastPoint['associated_event'] | null>(null);

  // Fungsi Lazy Loading untuk memanggil Google Gemini secara asinkron tanpa memblokir grafik
  const fetchAiInsight = useCallback(async (forecastResult: SalesForecastResult, force = false) => {
    try {
      setLoadingAI(true);
      const events: LocalEventInput[] = [];
      if (forecastResult.forecast_data) {
        const seen = new Set<string>();
        for (const p of forecastResult.forecast_data) {
          if (p.associated_event && !seen.has(p.associated_event.id)) {
            seen.add(p.associated_event.id);
            events.push({
              id: p.associated_event.id,
              title: p.associated_event.title,
              province_name: p.associated_event.province_name,
              city_name: p.associated_event.city_name,
              start_date: p.date,
              end_date: p.date,
              expected_tourist_impact: p.associated_event.impact,
            });
          }
        }
      }

      const res = await fetch('/api/forecast/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horizon,
          forceRefresh: force,
          total_projected_revenue: forecastResult.total_projected_revenue,
          growth_percentage: forecastResult.growth_percentage,
          busy_summary: forecastResult.busy_summary,
          quiet_summary: forecastResult.quiet_summary,
          is_fallback_mode: forecastResult.is_fallback_mode,
          events,
        }),
      });

      const json = await res.json();
      if (json.success && json.ai_qualitative_note) {
        setData((prev) => prev ? { ...prev, ai_qualitative_note: json.ai_qualitative_note } : prev);
      }
    } catch (err) {
      console.error('Failed to fetch lazy AI insight:', err);
    } finally {
      setLoadingAI(false);
    }
  }, [horizon]);

  // Pemuatan data deret waktu utama (Sangat Cepat < 150ms)
  const fetchForecast = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch(`/api/forecast?horizon=${horizon}`);
      const json: SalesForecastResult = await res.json();
      setData(json);

      // Jika belum ada narasi AI di cache database, muat secara asinkron di latar belakang
      if (!json.ai_qualitative_note) {
        fetchAiInsight(json, false);
      } else {
        setLoadingAI(false);
      }
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [horizon, fetchAiInsight]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const handleRefreshAI = async () => {
    if (!data || refreshingAI || loadingAI) return;
    setRefreshingAI(true);
    await fetchAiInsight(data, true);
    setRefreshingAI(false);
  };

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
          `✅ Kalibrasi sukses! α=${json.tuned_params.alpha}, β=${json.tuned_params.beta}, γ=${json.tuned_params.gamma} (MAPE: ${json.mape_validated}% — ${json.mape_interpretation})`
        );
        await fetchForecast(true);
      } else {
        setCalibrateResult(`⚠️ ${json.error}`);
      }
    } catch {
      setCalibrateResult('❌ Gagal menghubungi server kalibrasi.');
    } finally {
      setCalibrating(false);
    }
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const formatCompactIDR = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1_000_000) {
      const num = (val / 1_000_000).toFixed(1).replace('.0', '');
      return `${num} jt`;
    }
    if (val >= 1_000) {
      const num = (val / 1_000).toFixed(1).replace('.0', '');
      return `${num} rb`;
    }
    return `${val}`;
  };

  // =========================================================================
  // Chart Data Preparation: Continuous curve connecting History & Forecast
  // =========================================================================
  const prepareChartData = () => {
    if (!data || !data.historical_data || !data.forecast_data) return [];

    // Proporsional: 14 hari histori untuk horizon 7 hari, 30 hari histori untuk horizon 15 hari
    const historySliceDays = horizon === '15_days' ? 30 : 14;
    const recentHistory = data.historical_data.slice(-historySliceDays);

    const chartPoints: Array<{
      date: string;
      rawDate: string;
      historical_sales: number | null;
      predicted_sales: number | null;
      confidence_range: [number, number] | null;
      historical_orders: number | null;
      predicted_orders: number | null;
      orders_confidence_range: [number, number] | null;
      event?: ForecastPoint['associated_event'] | null;
    }> = [];

    // 1. Data Historis
    recentHistory.forEach((p, idx) => {
      const isLastHistorical = idx === recentHistory.length - 1;
      const formattedDate = p.date.slice(5); // MM-DD

      chartPoints.push({
        date: formattedDate,
        rawDate: p.date,
        historical_sales: p.sales_amount,
        // Jembatan titik temu agar garis proyeksi oranye tersambung dari titik terakhir histori
        predicted_sales: isLastHistorical ? p.sales_amount : null,
        confidence_range: isLastHistorical ? [p.sales_amount, p.sales_amount] : null,
        historical_orders: p.order_count,
        predicted_orders: isLastHistorical ? p.order_count : null,
        orders_confidence_range: isLastHistorical ? [p.order_count, p.order_count] : null,
        event: null,
      });
    });

    // 2. Data Forecast
    data.forecast_data.forEach((p) => {
      const formattedDate = p.date.slice(5); // MM-DD
      chartPoints.push({
        date: formattedDate,
        rawDate: p.date,
        historical_sales: null,
        predicted_sales: p.predicted_sales,
        confidence_range: [p.confidence_lower, p.confidence_upper],
        historical_orders: null,
        predicted_orders: p.predicted_orders,
        orders_confidence_range: [p.orders_confidence_lower, p.orders_confidence_upper],
        event: p.associated_event || null,
      });
    });

    return chartPoints;
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-slate-800 font-bold font-outfit text-sm">
            Memuat Hybrid Sales Forecast LORA...
          </p>
          <p className="text-xs text-slate-500">
            Menghitung smoothing Holt-Winters &amp; Kalender Event DIY-Jateng
          </p>
        </div>
      </div>
    );
  }

  const isGrowthPositive = (data?.growth_percentage || 0) >= 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER SELARAS DASHBOARD LORA */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
              <span>Prediksi Penjualan AI LORA</span>
            </div>
            {data?.is_fallback_mode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Cold-Start (Moving Avg)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Holt-Winters Smoothing</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
            Hybrid Sales Forecast
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Proyeksi penjualan dan jumlah transaksi berbasis {data?.data_days_available || 0} hari data historis, siklus musiman 7 hari, &amp; kalender event DIY-Jateng.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setHorizon('7_days')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                horizon === '7_days'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari Ke Depan
            </button>
            <button
              onClick={() => setHorizon('15_days')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                horizon === '15_days'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15 Hari Ke Depan
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INSIGHT AI BANNER (Deep Indigo & Terracotta Warm Styling) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/60 p-6 sm:p-7 shadow-md space-y-4 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wide">
            <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            </div>
            <span className="font-outfit font-extrabold uppercase">Rekomendasi AI Strategis</span>
          </div>

          <button
            onClick={handleRefreshAI}
            disabled={refreshingAI}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-100 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
            <span>{refreshingAI ? 'Memperbarui...' : 'Perbarui Insight'}</span>
          </button>
        </div>

        {loadingAI && !data?.ai_qualitative_note ? (
          <div className="space-y-3 py-1 animate-pulse relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>AI LORA sedang menganalisis strategi proyeksi bisnis Anda...</span>
            </div>
            <div className="h-3.5 bg-indigo-900/60 rounded-full w-full" />
            <div className="h-3.5 bg-indigo-900/60 rounded-full w-5/6" />
            <div className="h-3.5 bg-indigo-900/40 rounded-full w-4/6" />
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium relative z-10 space-y-3">
            <MarkdownRenderer 
              content={data?.ai_qualitative_note || data?.auto_insight || 'Proyeksi omzet periode ini siap meningkat. Pantau ketersediaan stok produk unggulan Anda.'} 
              className="text-indigo-100"
            />

          {/* Event Daerah Terdeteksi di Periode Forecast */}
          {data?.forecast_data && (
            (() => {
              const detectedEvents = new Map<string, { event: NonNullable<ForecastPoint['associated_event']>; dates: string[] }>();
              for (const p of data.forecast_data) {
                if (p.associated_event) {
                  const ev = p.associated_event;
                  if (!detectedEvents.has(ev.id)) {
                    detectedEvents.set(ev.id, { event: ev, dates: [p.date] });
                  } else {
                    detectedEvents.get(ev.id)!.dates.push(p.date);
                  }
                }
              }
              const eventsList = Array.from(detectedEvents.values());
              if (eventsList.length === 0) return null;

              return (
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  {eventsList.map(({ event, dates }) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-sm"
                      title="Klik untuk melihat detail event daerah"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        🎪 {event.title} ({dates.length === 1 ? dates[0].slice(5) : `${dates[0].slice(5)} s/d ${dates[dates.length - 1].slice(5)}`})
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()
          )}
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-3 border-t border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-200/80 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="italic text-indigo-200/80">
              Prediksi berdasarkan {data?.data_days_available || 0} hari histori transaksi.
            </span>
            <span className="text-[11px] text-amber-400 font-bold">
              *Tingkat akurasi terus meningkat seiring bertambahnya transaksi.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCalibrate}
              disabled={calibrating || (data?.is_fallback_mode ?? false)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                data?.is_fallback_mode
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-terracotta hover:bg-terracotta-hover text-white active:scale-95'
              }`}
              title="Jalankan kalibrasi 64 grid-search parameter"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${calibrating ? 'animate-spin' : ''}`} />
              <span>{calibrating ? 'Mengkalibrasi...' : 'Prediksi Ulang / Kalibrasi'}</span>
            </button>
          </div>
        </div>

        {calibrateResult && (
          <div className="text-xs font-medium text-amber-200 bg-indigo-950/90 px-4 py-2.5 rounded-2xl border border-amber-500/30 shadow-inner relative z-10">
            {calibrateResult}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. THREE SUMMARY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Proyeksi Omzet */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Proyeksi Omzet {horizon === '15_days' ? '15' : '7'} Hari
            </span>
            <div className="p-2 bg-amber-50 text-terracotta rounded-2xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900">
              {formatIDR(data?.total_projected_revenue || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
              <span className={`inline-flex items-center font-bold ${isGrowthPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isGrowthPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                {isGrowthPositive ? '+' : ''}{data?.growth_percentage || 0}%
              </span>
              <span>vs periode sebelumnya</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hari Diprediksi Ramai */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hari Diprediksi Ramai
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-outfit font-extrabold text-emerald-700">
              {data?.busy_summary?.count || 0} <span className="text-sm font-semibold text-emerald-600">hari</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {data?.busy_summary?.days_label || 'Tidak ada lonjakan khusus'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Hari Diprediksi Sepi */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hari Diprediksi Sepi
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-outfit font-extrabold text-rose-700">
              {data?.quiet_summary?.count || 0} <span className="text-sm font-semibold text-rose-600">hari</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                {data?.quiet_summary?.days_label || 'Semua hari stabil ramai'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHART 1: PROYEKSI OMZET */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900">
              Proyeksi Omzet {horizon === '15_days' ? '15' : '7'} Hari Ke Depan
            </h2>
            <p className="text-xs text-slate-500">
              Garis abu-abu menunjukkan histori omzet, garis oranye proyeksi ke depan dengan area batas probabilitas (MAPE {data?.accuracy?.mape_validated?.toFixed(1) || 0}%).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-slate-400 inline-block" />
              <span className="text-slate-600">Histori</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-terracotta inline-block" />
              <span className="text-terracotta font-bold">Proyeksi AI</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 22, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="salesConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatCompactIDR(v)}
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => {
                  if (val === null || val === undefined) return ['-', ''];
                  if (Array.isArray(val) && typeof val[0] === 'number' && typeof val[1] === 'number') {
                    return [`${formatIDR(val[0])} — ${formatIDR(val[1])}`, 'Rentang Probabilitas'];
                  }
                  if (typeof val === 'number') {
                    if (name === 'historical_sales') return [formatIDR(val), 'Penjualan Historis'];
                    if (name === 'predicted_sales') return [formatIDR(val), 'Proyeksi Penjualan'];
                  }
                  return [String(val), String(name || '')];
                }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  color: '#fff',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                  fontSize: '12px',
                }}
              />

              {/* Area Confidence Band Shading */}
              <Area
                type="monotone"
                dataKey="confidence_range"
                fill="url(#salesConfidenceGrad)"
                stroke="#D97706"
                strokeWidth={1}
                strokeDasharray="2 2"
                strokeOpacity={0.6}
                name="Confidence Band"
                isAnimationActive={true}
              />

              {/* Historical Solid Line */}
              <Line
                type="monotone"
                dataKey="historical_sales"
                stroke="#1E293B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1E293B', stroke: '#FFFFFF', strokeWidth: 2 }}
                name="Penjualan Historis"
                connectNulls={true}
              >
                <LabelList
                  dataKey="historical_sales"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' ? formatCompactIDR(val) : '')}
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#334155' }}
                />
              </Line>

              {/* Forecast Dashed Line with Data Labels & Event Pins */}
              <Line
                type="monotone"
                dataKey="predicted_sales"
                stroke="#D97706"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                name="Proyeksi Penjualan"
                connectNulls={true}
                dot={(props: Record<string, unknown>) => {
                  const cx = props.cx as number;
                  const cy = props.cy as number;
                  const payload = props.payload as {
                    predicted_sales?: number | null;
                    event?: ForecastPoint['associated_event'];
                  };

                  if (payload?.predicted_sales === null || payload?.predicted_sales === undefined || isNaN(cy) || cy <= 5) {
                    return <React.Fragment key={`empty-sales-dot-${cx}`} />;
                  }

                  if (payload?.event) {
                    return (
                      <g key={`event-pin-${cx}`} className="cursor-pointer" onClick={() => setSelectedEvent(payload.event)}>
                        <circle cx={cx} cy={cy} r={7} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} className="animate-pulse" />
                        <circle cx={cx} cy={cy} r={3} fill="#78350F" />
                      </g>
                    );
                  }
                  return (
                    <circle
                      key={`dot-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#D97706"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }}
              >
                <LabelList
                  dataKey="predicted_sales"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? formatCompactIDR(val) : '')}
                  style={{ fontSize: '10px', fontWeight: 800, fill: '#D97706' }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CHART 2: PROYEKSI JUMLAH TRANSAKSI (Order Count) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900">
              Proyeksi Jumlah Transaksi {horizon === '15_days' ? '15' : '7'} Hari Ke Depan
            </h2>
            <p className="text-xs text-slate-500">
              Estimasi total volume pesanan masuk harian (total proyeksi: {data?.total_projected_orders || 0} transaksi).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-slate-400 inline-block" />
              <span className="text-slate-600">Histori Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
              <span className="text-emerald-600 font-bold">Proyeksi Order</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 22, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="orderConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => {
                  if (val === null || val === undefined) return ['-', ''];
                  if (Array.isArray(val) && typeof val[0] === 'number' && typeof val[1] === 'number') {
                    return [`${val[0]} — ${val[1]} order`, 'Rentang Probabilitas'];
                  }
                  if (typeof val === 'number') {
                    if (name === 'historical_orders') return [`${val} transaksi`, 'Histori Transaksi'];
                    if (name === 'predicted_orders') return [`${val} transaksi`, 'Proyeksi Transaksi'];
                  }
                  return [String(val), String(name || '')];
                }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  color: '#fff',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              />

              {/* Confidence Band Orders */}
              <Area
                type="monotone"
                dataKey="orders_confidence_range"
                fill="url(#orderConfidenceGrad)"
                stroke="#10B981"
                strokeWidth={1}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
                name="Confidence Band"
              />

              {/* Historical Orders */}
              <Line
                type="monotone"
                dataKey="historical_orders"
                stroke="#1E293B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1E293B', stroke: '#FFFFFF', strokeWidth: 2 }}
                name="Histori Transaksi"
                connectNulls={true}
              >
                <LabelList
                  dataKey="historical_orders"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' ? `${val}` : '')}
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#334155' }}
                />
              </Line>

              {/* Forecast Orders */}
              <Line
                type="monotone"
                dataKey="predicted_orders"
                stroke="#10B981"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={(props: Record<string, unknown>) => {
                  const cx = props.cx as number;
                  const cy = props.cy as number;
                  const payload = props.payload as {
                    predicted_orders?: number | null;
                  };

                  if (payload?.predicted_orders === null || payload?.predicted_orders === undefined || isNaN(cy) || cy <= 5) {
                    return <React.Fragment key={`empty-order-dot-${cx}`} />;
                  }

                  return (
                    <circle
                      key={`dot-order-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }}
                name="Proyeksi Transaksi"
                connectNulls={true}
              >
                <LabelList
                  dataKey="predicted_orders"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? `${val}` : '')}
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#10B981' }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. EVENT MODAL POPUP */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 text-terracotta rounded-2xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-outfit font-extrabold text-slate-900 text-base">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>{selectedEvent.city_name ? `${selectedEvent.city_name}, ` : ''}{selectedEvent.province_name}</span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Estimasi Dampak Wisatawan: {selectedEvent.impact.toUpperCase()}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Lonjakan permintaan diperkirakan meningkat hingga{' '}
                  {selectedEvent.impact === 'massive' ? '+75%' : selectedEvent.impact === 'high' ? '+45%' : selectedEvent.impact === 'medium' ? '+25%' : '+10%'}.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                💡 <span className="font-bold text-slate-800">Tips Strategis LORA:</span> Tambah persediaan produk oleh-oleh khas daerah serta siapkan promo bundling untuk menarik wisatawan lokal maupun mancanegara.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-sm cursor-pointer"
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
