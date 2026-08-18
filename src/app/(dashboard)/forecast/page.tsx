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
} from '@/lib/forecast/holtWinters';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';

export default function SalesForecastPage() {
  const [horizon, setHorizon] = useState<ForecastHorizon>('7_days');
  const [data, setData] = useState<SalesForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrateResult, setCalibrateResult] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ForecastPoint['associated_event'] | null>(null);

  const fetchForecast = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch(`/api/forecast?horizon=${horizon}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [horizon]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const handleRefreshAI = async () => {
    setRefreshingAI(true);
    await fetchForecast(true);
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
          `✅ Kalibrasi sukses! α=${json.tuned_params.alpha}, β=${json.tuned_params.beta}, γ=${json.tuned_params.gamma} (MAPE Validated: ${json.mape_validated}% — ${json.mape_interpretation})`
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

    const historySliceDays = horizon === '15_days' ? 15 : 7;
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
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-slate-800 dark:text-slate-200 font-semibold">
            Memuat Hybrid Sales Forecast LORA...
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menghitung smoothing Holt-Winters &amp; Kalender Event DIY-Jateng
          </p>
        </div>
      </div>
    );
  }

  const isGrowthPositive = (data?.growth_percentage || 0) >= 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* 1. HEADER & HORIZON TOGGLE */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
              Forecast Penjualan
            </h1>
            {data?.is_fallback_mode ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-700">
                <Info className="w-3.5 h-3.5" />
                Mode Cold-Start (Moving Average)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/50 dark:border-emerald-700">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Holt-Winters Triple Exponential Smoothing
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
            Proyeksi penjualan dan jumlah transaksi berbasis {data?.data_days_available || 0} hari data historis, siklus musiman 7 hari, &amp; kalender event DIY-Jateng.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setHorizon('7_days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                horizon === '7_days'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Hari Ke Depan
            </button>
            <button
              onClick={() => setHorizon('15_days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* ========================================================================= */}
      {/* 2. INSIGHT AI BANNER (Deep Indigo & Terracotta Warm Premium Styling) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800/60 p-5 md:p-6 shadow-md space-y-3.5 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm md:text-base tracking-wide">
            <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            </div>
            <span>INSIGHT AI</span>
          </div>

          <button
            onClick={handleRefreshAI}
            disabled={refreshingAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-100 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
            {refreshingAI ? 'Memperbarui...' : 'Perbarui'}
          </button>
        </div>

        <div className="text-xs md:text-sm text-indigo-100 leading-relaxed font-medium relative z-10">
          <MarkdownRenderer 
            content={data?.ai_qualitative_note || data?.auto_insight || 'Proyeksi omzet periode ini siap meningkat. Pantau ketersediaan stok produk unggulan Anda.'} 
            className="text-indigo-100"
          />
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-200/80 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="italic text-indigo-200/80">
              Prediksi berdasarkan {data?.data_days_available || 0} hari histori transaksi.
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              *Pastikan data transaksi sudah terupdate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCalibrate}
              disabled={calibrating || (data?.is_fallback_mode ?? false)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                data?.is_fallback_mode
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white active:scale-95'
              }`}
              title="Jalankan kalibrasi 64 grid-search parameter"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${calibrating ? 'animate-spin' : ''}`} />
              {calibrating ? 'Mengkalibrasi...' : 'Prediksi Ulang / Kalibrasi'}
            </button>
          </div>
        </div>

        {calibrateResult && (
          <div className="text-xs font-medium text-amber-200 bg-indigo-950/90 px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-inner relative z-10">
            {calibrateResult}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. THREE SUMMARY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Proyeksi Omzet */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Proyeksi Omzet {horizon === '15_days' ? '15' : '7'} Hari
            </span>
            <div className="p-2 bg-sky-100 dark:bg-sky-950/70 rounded-xl text-sky-700 dark:text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatIDR(data?.total_projected_revenue || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className={`inline-flex items-center font-bold ${isGrowthPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isGrowthPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                {isGrowthPositive ? '+' : ''}{data?.growth_percentage || 0}%
              </span>
              <span>vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hari Diprediksi Ramai */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Hari Diprediksi Ramai
            </span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 rounded-xl text-emerald-700 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {data?.busy_summary?.count || 0} <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">hari</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                {data?.busy_summary?.days_label || 'Tidak ada lonjakan khusus'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Hari Diprediksi Sepi */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
              Hari Diprediksi Sepi
            </span>
            <div className="p-2 bg-rose-100 dark:bg-rose-950/70 rounded-xl text-rose-700 dark:text-rose-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-rose-700 dark:text-rose-400">
              {data?.quiet_summary?.count || 0} <span className="text-base font-medium text-rose-600 dark:text-rose-400">hari</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-rose-100/80 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                {data?.quiet_summary?.days_label || 'Semua hari relatif ramai'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHART 1: PROYEKSI OMZET (Solid Lines for History + Dashed for Forecast) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              Proyeksi omzet {horizon === '15_days' ? '15' : '7'} hari ke depan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Garis padat terang menunjukkan histori omzet, garis oranye proyeksi ke depan dengan area batas probabilitas (MAPE {data?.accuracy?.mape_validated?.toFixed(1) || 0}%).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-slate-400 dark:bg-slate-300 inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Histori</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
              <span className="text-amber-700 dark:text-amber-400 font-semibold">Proyeksi</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 22, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="salesConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#475569', opacity: 0.3 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => formatCompactIDR(v)}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => {
                  if (val === null || val === undefined) return ['-', ''];
                  if (Array.isArray(val) && typeof val[0] === 'number' && typeof val[1] === 'number') {
                    return [`${formatIDR(val[0])} — ${formatIDR(val[1])}`, 'Confidence Band'];
                  }
                  if (typeof val === 'number') {
                    if (name === 'historical_sales') return [formatIDR(val), 'Penjualan Historis'];
                    if (name === 'predicted_sales') return [formatIDR(val), 'Proyeksi Penjualan'];
                  }
                  return [String(val), String(name || '')];
                }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
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

              {/* Historical Solid Line (Connecting All Dots Clearly) */}
              <Line
                type="monotone"
                dataKey="historical_sales"
                stroke="#94A3B8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#CBD5E1', stroke: '#0F172A', strokeWidth: 2 }}
                name="Penjualan Historis"
                connectNulls={true}
              >
                <LabelList
                  dataKey="historical_sales"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' ? formatCompactIDR(val) : '')}
                  style={{ fontSize: '10px', fontWeight: 600, fill: '#CBD5E1' }}
                />
              </Line>

              {/* Forecast Dashed Line with Data Labels & Event Pins */}
              <Line
                type="monotone"
                dataKey="predicted_sales"
                stroke="#D97706"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                name="Proyeksi Penjualan"
                connectNulls={true}
                dot={(props: Record<string, unknown>) => {
                  const cx = props.cx as number;
                  const cy = props.cy as number;
                  const payload = props.payload as {
                    predicted_sales?: number | null;
                    event?: ForecastPoint['associated_event'];
                  };

                  // ABAIKAN rendering titik jika data predicted_sales adalah null (titik histori) atau cy berada di paling atas (cy <= 0)
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
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#F59E0B' }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CHART 2: PROYEKSI JUMLAH TRANSAKSI (Order Count) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              Proyeksi jumlah transaksi {horizon === '15_days' ? '15' : '7'} hari ke depan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimasi total volume pesanan masuk harian (total proyeksi: {data?.total_projected_orders || 0} transaksi).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-slate-400 dark:bg-slate-300 inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Histori Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Proyeksi Order</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 22, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="orderConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#475569', opacity: 0.3 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => {
                  if (val === null || val === undefined) return ['-', ''];
                  if (Array.isArray(val) && typeof val[0] === 'number' && typeof val[1] === 'number') {
                    return [`${val[0]} — ${val[1]} order`, 'Confidence Band'];
                  }
                  if (typeof val === 'number') {
                    if (name === 'historical_orders') return [`${val} transaksi`, 'Histori Transaksi'];
                    if (name === 'predicted_orders') return [`${val} transaksi`, 'Proyeksi Transaksi'];
                  }
                  return [String(val), String(name || '')];
                }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
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

              {/* Historical Orders (Connecting All Dots Clearly) */}
              <Line
                type="monotone"
                dataKey="historical_orders"
                stroke="#94A3B8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#CBD5E1', stroke: '#0F172A', strokeWidth: 2 }}
                name="Histori Transaksi"
                connectNulls={true}
              >
                <LabelList
                  dataKey="historical_orders"
                  position="top"
                  offset={10}
                  formatter={(val: unknown) => (typeof val === 'number' ? `${val}` : '')}
                  style={{ fontSize: '10px', fontWeight: 600, fill: '#CBD5E1' }}
                />
              </Line>

              {/* Forecast Orders */}
              <Line
                type="monotone"
                dataKey="predicted_orders"
                stroke="#10B981"
                strokeWidth={2.5}
                strokeDasharray="5 5"
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
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#34D399' }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. EVENT MODAL POPUP (Jika Ada Event Terkait yang Diklik) */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
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

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{selectedEvent.city_name ? `${selectedEvent.city_name}, ` : ''}{selectedEvent.province_name}</span>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                  Estimasi Dampak Wisatawan: {selectedEvent.impact.toUpperCase()}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lonjakan permintaan diperkirakan meningkat hingga{' '}
                  {selectedEvent.impact === 'massive' ? '+75%' : selectedEvent.impact === 'high' ? '+45%' : selectedEvent.impact === 'medium' ? '+25%' : '+10%'}.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                💡 <span className="font-semibold">Tips Strategis LORA:</span> Tambah persediaan produk oleh-oleh khas daerah serta siapkan etalase digital Anda dengan promo bundling untuk menarik wisatawan lokal maupun mancanegara.
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
