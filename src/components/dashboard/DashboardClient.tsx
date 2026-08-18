'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Store,
  MapPin,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DashboardClientProps {
  business: any;
  kpis: {
    totalRevenue: number;
    totalRevenueCompare: number; // Bulan lalu
    orderCount: number;
    orderCountCompare: number;
    activeProductCount: number;
    lowStockCount: number;
    totalImpressions: number;
    totalImpressionsCompare: number;
  };
  bhs: {
    overall_score: number;
    revenue_score: number;
    margin_score: number;
    inventory_turn_score: number;
    retention_score: number;
    safety_stock_score: number;
    event_adaptability_score: number;
    ai_narrative: string;
  };
  dailySales: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export default function DashboardClient({
  business,
  kpis,
  bhs,
  dailySales,
}: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState<'7_days' | '30_days'>('30_days');
  const [recalculatingBhs, setRecalculatingBhs] = useState(false);
  const [currentBhs, setCurrentBhs] = useState(bhs);

  // Formatter mata uang Rupiah
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Hitung persentase pertumbuhan KPI
  const revenueGrowth = useMemo(() => {
    if (kpis.totalRevenueCompare === 0) return 100;
    return Math.round(((kpis.totalRevenue - kpis.totalRevenueCompare) / kpis.totalRevenueCompare) * 100);
  }, [kpis]);

  const orderGrowth = useMemo(() => {
    if (kpis.orderCountCompare === 0) return 100;
    return Math.round(((kpis.orderCount - kpis.orderCountCompare) / kpis.orderCountCompare) * 100);
  }, [kpis]);

  const impressionsGrowth = useMemo(() => {
    if (kpis.totalImpressionsCompare === 0) return 100;
    return Math.round(((kpis.totalImpressions - kpis.totalImpressionsCompare) / kpis.totalImpressionsCompare) * 100);
  }, [kpis]);

  // Filter data grafik berdasarkan time range terpilih
  const filteredChartData = useMemo(() => {
    const sorted = [...dailySales].sort((a, b) => a.date.localeCompare(b.date));
    if (timeRange === '7_days') {
      return sorted.slice(-7);
    }
    return sorted.slice(-30);
  }, [dailySales, timeRange]);

  // Handle reload/recalculate BHS
  const handleRecalculateBhs = async () => {
    setRecalculatingBhs(true);
    try {
      const res = await fetch(`/api/ai/bhs?businessId=${business.id}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setCurrentBhs({
          overall_score: data.overall_score,
          revenue_score: data.revenue_score,
          margin_score: data.margin_score,
          inventory_turn_score: data.inventory_turn_score,
          retention_score: data.retention_score,
          safety_stock_score: data.safety_stock_score,
          event_adaptability_score: data.event_adaptability_score,
          ai_narrative: data.ai_narrative,
        });
      }
    } catch (err) {
      console.error('Failed to recalculate BHS:', err);
    } finally {
      setRecalculatingBhs(false);
    }
  };

  // Menentukan warna gauge BHS berdasarkan skor
  const bhsColorClass = useMemo(() => {
    const score = currentBhs.overall_score;
    if (score >= 75) return { text: 'text-emerald-500', stroke: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 50) return { text: 'text-amber-500', stroke: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-rose-500', stroke: '#F43F5E', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  }, [currentBhs.overall_score]);

  // Hitung circumference untuk Circular Gauge BHS
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(() => {
    const score = Math.max(0, Math.min(100, currentBhs.overall_score));
    return circumference - (score / 100) * circumference;
  }, [currentBhs.overall_score, circumference]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-70"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
          🏪 Seller Centre - Dashboard UMKM
        </div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Selamat Datang, {business.name}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Pantau kinerja penjualan, stok inventaris, proyeksi omzet AI, dan rekomendasi event regional DIY-Jateng secara real-time.
        </p>
      </div>

      {/* KPI Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. OMZET */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Omzet 30 Hari</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-outfit font-extrabold text-slate-900">{formatCurrency(kpis.totalRevenue)}</p>
          <div className="flex items-center gap-1.5">
            {revenueGrowth >= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{revenueGrowth}%
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> {revenueGrowth}%
              </span>
            )}
            <span className="text-[10px] text-slate-400">vs bulan lalu</span>
          </div>
        </div>

        {/* 2. PESANAN SUKSES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pesanan Sukses</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-outfit font-extrabold text-slate-900">{kpis.orderCount} Pesanan</p>
          <div className="flex items-center gap-1.5">
            {orderGrowth >= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{orderGrowth}%
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> {orderGrowth}%
              </span>
            )}
            <span className="text-[10px] text-slate-400">vs bulan lalu</span>
          </div>
        </div>

        {/* 3. PRODUK AKTIF */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Produk Inventori</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-outfit font-extrabold text-slate-900">{kpis.activeProductCount} Item</p>
          <div className="flex items-center gap-1">
            {kpis.lowStockCount > 0 ? (
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {kpis.lowStockCount} perlu di-restock
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600">Seluruh stok aman</span>
            )}
          </div>
        </div>

        {/* 4. IMPRESSIONS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pengunjung Etalase</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-outfit font-extrabold text-slate-900">{kpis.totalImpressions} Impresi</p>
          <div className="flex items-center gap-1.5">
            {impressionsGrowth >= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{impressionsGrowth}%
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> {impressionsGrowth}%
              </span>
            )}
            <span className="text-[10px] text-slate-400">vs bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Main Grid: BHS Gauge & Recharts Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Health Score (BHS) Gauge */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Kesehatan Bisnis (BHS)</h2>
            <button
              onClick={handleRecalculateBhs}
              disabled={recalculatingBhs}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
              title="Hitung Ulang Skor Kesehatan"
            >
              <RotateCcw className={`w-4 h-4 ${recalculatingBhs ? 'animate-spin text-terracotta' : ''}`} />
            </button>
          </div>

          {/* Circular Gauge */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background track circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth={strokeWidth}
                />
                {/* Progress bar circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={bhsColorClass.stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-outfit font-black text-slate-900 leading-none">
                  {currentBhs.overall_score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Skor BHS</span>
              </div>
            </div>

            {/* Health Level Badge */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${bhsColorClass.bg} ${bhsColorClass.text} ${bhsColorClass.border}`}>
              {currentBhs.overall_score >= 75 ? '🏪 Sehat & Prima' : currentBhs.overall_score >= 50 ? '⚠️ Butuh Perhatian' : '🚨 Kritis'}
            </span>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Omzet</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.revenue_score >= 75 ? 'text-emerald-600' : currentBhs.revenue_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.revenue_score}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Margin</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.margin_score >= 75 ? 'text-emerald-600' : currentBhs.margin_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.margin_score}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Perputaran</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.inventory_turn_score >= 75 ? 'text-emerald-600' : currentBhs.inventory_turn_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.inventory_turn_score}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Retensi</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.retention_score >= 75 ? 'text-emerald-600' : currentBhs.retention_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.retention_score}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Keamanan</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.safety_stock_score >= 75 ? 'text-emerald-600' : currentBhs.safety_stock_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.safety_stock_score}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Event</p>
              <p className={`text-xs font-black font-outfit mt-0.5 ${currentBhs.event_adaptability_score >= 75 ? 'text-emerald-600' : currentBhs.event_adaptability_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{currentBhs.event_adaptability_score}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Recharts Line Chart for Daily Revenue Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Tren Pendapatan & Omzet</h2>
              <p className="text-[11px] text-slate-400 font-medium">Visualisasi pergerakan kas toko harian</p>
            </div>

            {/* Range Selector Switch */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
              <button
                onClick={() => setTimeRange('7_days')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${timeRange === '7_days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => setTimeRange('30_days')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${timeRange === '30_days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                30 Hari Terakhir
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-64 text-xs font-semibold">
            {filteredChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" cx="0" cy="0" r="1" fx="0" fy="0">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(tick) => {
                      const dateObj = new Date(tick);
                      return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    }}
                    stroke="#94A3B8"
                    fontSize={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                      return val;
                    }}
                    stroke="#94A3B8"
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      fontFamily: 'sans-serif',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [formatCurrency(value), 'Pendapatan'];
                      return [value, 'Total Order'];
                    }}
                    labelFormatter={(label) => {
                      const dateObj = new Date(String(label));
                      return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6">
                <Store className="w-8 h-8 mb-2 stroke-1.5" />
                <p>Belum ada data transaksi untuk grafik</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic AI Recommendation Banner & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asisten AI BHS Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Kesehatan AI LORA
            </span>
            <h3 className="text-xl sm:text-2xl font-outfit font-bold leading-tight">
              Saran Bisnis AI untuk {business.name}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
              {currentBhs.ai_narrative || "Asisten AI LORA sedang mempersiapkan analisis kesehatan bisnis Anda."}
            </p>
          </div>

          <div>
            <Link
              href="/dashboard/ai-consultant"
              className="inline-flex items-center gap-2 px-5 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-2xl shadow-lg shadow-terracotta/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Konsultasi AI Selengkapnya</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quick Menu Aksi */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Aksi Cepat Seller</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/inventory"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-slate-500 group-hover:text-terracotta" />
                  <span className="text-xs font-bold text-slate-800">Kelola Stok & ROP</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all">→</span>
              </Link>

              <Link
                href="/dashboard/forecast"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-terracotta" />
                  <span className="text-xs font-bold text-slate-800">Lihat Proyeksi Forecast</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all">→</span>
              </Link>

              <Link
                href="/dashboard/events"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-500 group-hover:text-terracotta" />
                  <span className="text-xs font-bold text-slate-800">Kalender Event Daerah</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all">→</span>
              </Link>
            </div>
          </div>

          {/* Public Storefront URL Link */}
          {business.slug && (
            <a
              href={`/toko/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-colors"
            >
              <span>Lihat Halaman Toko Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
