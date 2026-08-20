'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Repeat, 
  ShoppingBag, 
  TrendingUp, 
  Search, 
  MessageSquare, 
  Ticket, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  HeartHandshake,
  Download,
  Calendar,
  Clock,
  Info,
  ShieldCheck,
  Loader2,
  Receipt,
  PlusCircle,
  Tag,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { RFMAnalyticsSummary, CustomerRFMProfile, RFMSegment } from '@/lib/engines/rfm-engine';

const SEGMENT_COLORS: Record<RFMSegment, string> = {
  'Champions': '#10B981',       // Emerald
  'Loyal Customers': '#3B82F6', // Blue
  'Potential Loyalists': '#8B5CF6', // Purple
  'At Risk': '#F59E0B',        // Amber
  'Hibernating': '#F43F5E',     // Rose
};

const SEGMENT_BADGES: Record<RFMSegment, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Champions': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', text: 'text-emerald-800', icon: Award },
  'Loyal Customers': { bg: 'bg-blue-50 text-blue-800 border-blue-300', text: 'text-blue-800', icon: HeartHandshake },
  'Potential Loyalists': { bg: 'bg-purple-50 text-purple-800 border-purple-300', text: 'text-purple-800', icon: Sparkles },
  'At Risk': { bg: 'bg-amber-50 text-amber-800 border-amber-300', text: 'text-amber-800', icon: AlertTriangle },
  'Hibernating': { bg: 'bg-rose-50 text-rose-800 border-rose-300', text: 'text-rose-800', icon: X },
};

const SEGMENT_DESCRIPTIONS: Record<RFMSegment, { summary: string; action: string }> = {
  'Champions': {
    summary: 'Pelanggan terbaik Anda yang berbelanja baru-baru ini, memiliki frekuensi order sangat sering, dan mengeluarkan total uang paling tinggi.',
    action: 'Berikan apresiasi VIP, akses produk edisi terbatas lebih awal, dan perlakuan khusus agar loyalitas tetap terjaga.'
  },
  'Loyal Customers': {
    summary: 'Pelanggan yang rutin bertransaksi dan responsif terhadap penawaran produk toko Anda secara konsisten.',
    action: 'Tawarkan produk pelengkap (cross-selling) dan voucher diskon khusus untuk mendorong pembelian berkala.'
  },
  'Potential Loyalists': {
    summary: 'Pelanggan baru atau pembeli berkala yang memiliki pengalaman belanja positif dan berpotensi menjadi pelanggan tetap.',
    action: 'Tawarkan diskon pembelian kedua atau program bundling produk untuk mempercepat transaksi berikutnya.'
  },
  'At Risk': {
    summary: 'Pelanggan yang dulunya sering atau belanja banyak, namun sudah lama sekali tidak pernah bertransaksi di toko Anda.',
    action: 'Kirimkan pesan personal sapaan kangen dan kupon win-back spesial (cashback) sebelum mereka beralih ke toko lain.'
  },
  'Hibernating': {
    summary: 'Pelanggan inaktif yang sudah sangat lama tidak berbelanja dan memiliki riwayat transaksi tergolong rendah.',
    action: 'Sajikan penawaran re-engagement dengan diskon produk paling laris (best-seller) untuk menarik kembali minat mereka.'
  },
};

interface StoreVoucher {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  target_segment?: string | null;
  min_order_amount: number;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
  starts_at: string;
  expires_at?: string | null;
}

export default function CustomerInsightsPage() {
  const [data, setData] = useState<RFMAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  // Interactive Segment Modal (dari klik Donut Chart)
  const [activeSegmentDetail, setActiveSegmentDetail] = useState<RFMSegment | null>(null);

  // WhatsApp Modal state
  const [activeWaCustomer, setActiveWaCustomer] = useState<CustomerRFMProfile | null>(null);
  const [waMessage, setWaMessage] = useState('');

  // Customer Transaction History Modal
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerRFMProfile | null>(null);

  // Dedicated Voucher Section State
  const [storeVouchers, setStoreVouchers] = useState<StoreVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscountType, setNewVoucherDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [newVoucherDiscountValue, setNewVoucherDiscountValue] = useState<number>(15);
  const [newVoucherSegment, setNewVoucherSegment] = useState<string>('ALL');
  const [newVoucherStartsAt, setNewVoucherStartsAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newVoucherExpiresDuration, setNewVoucherExpiresDuration] = useState<string>('14_days');
  const [newVoucherCustomExpiresDate, setNewVoucherCustomExpiresDate] = useState<string>('');
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState<number>(50000);
  const [newVoucherUsageLimit, setNewVoucherUsageLimit] = useState<number>(50);
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);

  // Fetch RFM Customer Data
  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics/customers');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load customer analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerData();
  }, []);

  // Fetch Active Store Vouchers
  const fetchVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const res = await fetch('/api/vouchers');
      const json = await res.json();
      if (json.vouchers) {
        setStoreVouchers(json.vouchers);
      }
    } catch (err) {
      console.error('Failed to load store vouchers:', err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    generateRandomVoucherCode();
  }, []);

  // Format currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Generate random voucher code helper
  const generateRandomVoucherCode = (seg?: string) => {
    const target = seg || newVoucherSegment;
    const prefix = target !== 'ALL' ? target.toUpperCase().replace(/\s+/g, '').slice(0, 5) : 'PROMO';
    setNewVoucherCode(`${prefix}${Math.floor(100 + Math.random() * 900)}`);
  };

  // Open WhatsApp Modal
  const openWaModal = (customer: CustomerRFMProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!customer.phone_number) {
      toast.error('Nomor WhatsApp pelanggan ini belum terdaftar di database.');
      return;
    }
    setActiveWaCustomer(customer);
    setWaMessage(customer.suggested_wa_template);
  };

  // Handle Save New Voucher to Database
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) {
      toast.error('Kode voucher wajib diisi');
      return;
    }

    setIsSavingVoucher(true);
    try {
      let expiresAtDate: string | null = null;
      const startDate = new Date(newVoucherStartsAt || Date.now());

      if (newVoucherExpiresDuration === '7_days') {
        expiresAtDate = new Date(startDate.getTime() + 7 * 86400000).toISOString();
      } else if (newVoucherExpiresDuration === '14_days') {
        expiresAtDate = new Date(startDate.getTime() + 14 * 86400000).toISOString();
      } else if (newVoucherExpiresDuration === '30_days') {
        expiresAtDate = new Date(startDate.getTime() + 30 * 86400000).toISOString();
      } else if (newVoucherExpiresDuration === 'custom' && newVoucherCustomExpiresDate) {
        expiresAtDate = new Date(newVoucherCustomExpiresDate).toISOString();
      }

      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newVoucherCode.trim().toUpperCase(),
          discount_type: newVoucherDiscountType,
          discount_value: Number(newVoucherDiscountValue),
          target_segment: newVoucherSegment === 'ALL' ? null : newVoucherSegment,
          min_order_amount: Number(newVoucherMinOrder || 0),
          usage_limit: Number(newVoucherUsageLimit || 100),
          starts_at: new Date(newVoucherStartsAt).toISOString(),
          expires_at: expiresAtDate,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Voucher ${newVoucherCode} berhasil diaktifkan ke toko!`);
        generateRandomVoucherCode();
        fetchVouchers();
      } else {
        toast.error(json.error || 'Gagal membuat voucher');
      }
    } catch (err) {
      console.error('Error submitting voucher:', err);
      toast.error('Gagal menghubungi server voucher');
    } finally {
      setIsSavingVoucher(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      toast.error('Tidak ada data pelanggan untuk diekspor');
      return;
    }

    const headers = [
      'ID Pelanggan',
      'Nama Lengkap',
      'No WhatsApp',
      'Segmen RFM',
      'Recency (Hari)',
      'Frekuensi Order',
      'Total Belanja (IDR)',
      'Skor RFM Rata-rata',
      'Skor R',
      'Skor F',
      'Skor M',
      'Metode Skoring',
      'Tanggal Order Terakhir'
    ];

    const rows = filteredCustomers.map(c => [
      `"${c.customer_id}"`,
      `"${c.full_name.replace(/"/g, '""')}"`,
      `"${c.phone_number || '-'}"`,
      `"${c.segment}"`,
      c.recency_days,
      c.frequency_count,
      c.monetary_total,
      c.overall_rfm_score,
      c.score_r,
      c.score_f,
      c.score_m,
      `"${c.scoring_method}"`,
      `"${c.last_order_date}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `pelanggan_lora_${selectedSegment.toLowerCase()}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Daftar ${filteredCustomers.length} kontak pelanggan berhasil diunduh!`);
  };

  // Filtered Customer List
  const filteredCustomers = (data?.customers || []).filter((c) => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone_number && c.phone_number.includes(searchQuery));
    const matchesSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  // Data Recharts Donut
  const chartData = data ? Object.entries(data.segment_distribution).map(([name, value]) => ({
    name,
    value,
  })) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse text-xs sm:text-sm">
          Menganalisis Perilaku Pelanggan &amp; Segmentasi RFM...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight text-slate-900">
            Customer Insight &amp; RFM Segmentation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analisis segmentasi perilaku pembeli terdaftar berbasis riwayat transaksi toko nyata.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
            data?.scoring_method === 'absolute_threshold'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
              data?.scoring_method === 'absolute_threshold' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            {data?.scoring_method === 'absolute_threshold' 
              ? 'Hybrid Absolute Threshold (N < 5)' 
              : 'Dynamic Quintile Percentile (N ≥ 5)'}
          </span>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekspor Kontak CSV ({filteredCustomers.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Banner Edukasi: Apa itu Customer Segmentation & Dimensi RFM */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Edukasi Analitik Bisnis LORA</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-outfit font-extrabold tracking-tight text-white">
              Segmentasi Pelanggan Berbasis Model RFM
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Metode analitis untuk mengelompokkan pembeli berdasarkan kebiasaan belanja nyata guna mengoptimalkan retensi toko. Model <strong>RFM (Recency, Frequency, Monetary)</strong> membagi profil pembeli ke dalam 3 dimensi kuantitatif utama:
            </p>
          </div>

          {/* 3 Kartu Dimensi RFM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>Recency (Kebaruan)</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Menghitung berapa hari sejak transaksi terakhir pembeli. Semakin baru, semakin tinggi kemungkinan mereka kembali berbelanja.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Repeat className="w-4 h-4" />
                <span>Frequency (Frekuensi)</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Menghitung seberapa sering pembeli melakukan order sukses. Mengukur tingkat loyalitas dan kebiasaan belanja rutin.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Monetary (Moneter)</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Akumulasi total uang rupiah yang dibelanjakan pembeli. Mengidentifikasi pembeli bernilai tinggi <em>(high-value buyers)</em>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid Utama: Kiri (Diagram Lingkaran) vs Kanan (4 Card KPI 2x2 Versi Bahasa Indonesia) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* KOLOM KIRI: Diagram Lingkaran Distribusi Segmen (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-outfit font-bold text-slate-900">
                Distribusi Segmen Pelanggan
              </h2>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Klik Irisan untuk Detail
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Proporsi pembeli toko berdasarkan matriks skor RFM.
            </p>
          </div>

          <div className="w-full h-64 my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => setActiveSegmentDetail(entry.name as RFMSegment)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SEGMENT_COLORS[entry.name as RFMSegment] || '#94A3B8'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} Pembeli`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '14px', color: '#fff', border: '1px solid #334155', fontSize: '12px' }}
                />
                <Legend 
                  onClick={(entry: any) => setActiveSegmentDetail(entry.value as RFMSegment)}
                  wrapperStyle={{ cursor: 'pointer', fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-600">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed">
              💡 <strong>Tips:</strong> Klik pada salah satu irisan diagram untuk membuka pop-up penjelasan &amp; rekomendasi promosi segmen tersebut.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN: Grid 2x2 Kartu KPI Bahasa Indonesia (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Pembeli Terdaftar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Pembeli Terdaftar
              </span>
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-outfit font-extrabold text-slate-900">
                {data?.total_customers || 0}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Pelanggan Terdaftar Aktif</p>
            </div>
          </div>

          {/* Card 2: Tingkat Pembelian Berulang */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tingkat Pembelian Berulang
              </span>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Repeat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-outfit font-extrabold text-emerald-700">
                {data?.repeat_customer_rate || 0}%
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Pelanggan Order &gt; 1 Kali (Repeat Rate)</p>
            </div>
          </div>

          {/* Card 3: Nilai Rata-rata Pesanan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nilai Rata-rata Pesanan (AOV)
              </span>
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-outfit font-extrabold text-slate-900">
                {formatIDR(data?.average_order_value || 0)}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Rata-rata Pengeluaran per Transaksi</p>
            </div>
          </div>

          {/* Card 4: Estimasi Nilai Seumur Hidup Pelanggan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estimasi Nilai Pelanggan (CLV)
              </span>
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-outfit font-extrabold text-slate-900">
                {formatIDR(data?.estimated_clv || 0)}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Customer Lifetime Value (Proyeksi Nilai)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Daftar Profil Pelanggan (Khusus Direct WhatsApp Promo) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Filter */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-outfit font-bold text-slate-900">
              Daftar Profil Pelanggan Toko ({filteredCustomers.length})
            </h2>
            {selectedSegment !== 'ALL' && (
              <button 
                onClick={() => setSelectedSegment('ALL')}
                className="text-xs text-amber-600 underline font-semibold cursor-pointer"
              >
                Reset Filter ({selectedSegment})
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari nama atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Segment Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
              >
                <option value="ALL">Semua Segmen</option>
                <option value="Champions">Champions</option>
                <option value="Loyal Customers">Loyal Customers</option>
                <option value="Potential Loyalists">Potential Loyalists</option>
                <option value="At Risk">At Risk</option>
                <option value="Hibernating">Hibernating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-100 text-xs">
              <tr>
                <th className="py-3.5 px-6">Pelanggan (Klik untuk Riwayat)</th>
                <th className="py-3.5 px-6">Segmen RFM</th>
                <th className="py-3.5 px-6">Recency</th>
                <th className="py-3.5 px-6">Frekuensi</th>
                <th className="py-3.5 px-6">Total Belanja</th>
                <th className="py-3.5 px-6">Skor RFM</th>
                <th className="py-3.5 px-6 text-right">Aksi Pemasaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada pelanggan terdaftar yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const badge = SEGMENT_BADGES[cust.segment];
                  const Icon = badge.icon;
                  const hasPhone = !!cust.phone_number && cust.phone_number.trim().length > 0;

                  return (
                    <tr 
                      key={cust.customer_id} 
                      onClick={() => setSelectedCustomerForDetail(cust)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {cust.avatar_url ? (
                            <img 
                              src={cust.avatar_url} 
                              alt={cust.full_name} 
                              className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                              {cust.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition-colors">
                              {cust.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {hasPhone ? cust.phone_number : 'Nomor Belum Terdaftar'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Segment Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cust.segment}
                        </span>
                      </td>

                      {/* Recency */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800">
                          {cust.recency_days === 0 ? 'Hari ini' : `${cust.recency_days} hari lalu`}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800">
                          {cust.frequency_count} Transaksi
                        </span>
                      </td>

                      {/* Monetary */}
                      <td className="py-4 px-6">
                        <span className="font-outfit font-extrabold text-slate-900">
                          {formatIDR(cust.monetary_total)}
                        </span>
                      </td>

                      {/* RFM Score breakdown */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{cust.overall_rfm_score} / 5</span>
                          <span className="text-[10px] text-slate-400 font-mono">R:{cust.score_r} F:{cust.score_f} M:{cust.score_m}</span>
                        </div>
                      </td>

                      {/* Action Button: ONLY Direct WhatsApp */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {hasPhone ? (
                            <button
                              onClick={(e) => openWaModal(cust, e)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer hover:scale-105"
                              title="Kirim Pesan Promosi WhatsApp Direct"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed border border-slate-200"
                              title="Nomor WhatsApp belum terdaftar di akun pembeli"
                            >
                              <span>Tanpa No. WA</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Section Terdedikasi: Manajemen & Generator Voucher Toko (Di Bawah Tabel) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-outfit font-extrabold text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-600" />
              <span>Manajemen Voucher Diskon &amp; Promosi Toko</span>
            </h2>
            <p className="text-xs text-slate-500">
              Buat kode kupon diskon baru untuk segmen pembeli tertentu dan pantau masa aktif voucher toko Anda.
            </p>
          </div>
          <button
            onClick={fetchVouchers}
            disabled={loadingVouchers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingVouchers ? 'animate-spin' : ''}`} />
            <span>Muat Ulang Voucher</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Generator Voucher Baru (5 Cols) */}
          <form onSubmit={handleCreateVoucher} className="lg:col-span-5 bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Buat Kupon Promo Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => generateRandomVoucherCode()}
                className="text-[11px] text-amber-600 font-bold hover:underline cursor-pointer"
              >
                Acak Kode
              </button>
            </div>

            {/* Kode Kupon */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Kode Voucher Toko:</label>
              <input
                type="text"
                value={newVoucherCode}
                onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                placeholder="Misal: VIP20, KANGEN15..."
                className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-600 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Tipe & Besar Diskon */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Tipe Diskon:</label>
                <select
                  value={newVoucherDiscountType}
                  onChange={(e) => setNewVoucherDiscountType(e.target.value as 'percent' | 'fixed')}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="percent">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Besar Diskon {newVoucherDiscountType === 'percent' ? '(%)' : '(Rp)'}:
                </label>
                <input
                  type="number"
                  value={newVoucherDiscountValue}
                  onChange={(e) => setNewVoucherDiscountValue(Number(e.target.value))}
                  min={1}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Target Segmen */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Segmen Pelanggan:</label>
              <select
                value={newVoucherSegment}
                onChange={(e) => {
                  setNewVoucherSegment(e.target.value);
                  generateRandomVoucherCode(e.target.value);
                }}
                className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="ALL">Semua Pembeli (Publik)</option>
                <option value="Champions">Khusus Segmen Champions (VIP)</option>
                <option value="Loyal Customers">Khusus Segmen Loyal Customers</option>
                <option value="Potential Loyalists">Khusus Segmen Potential Loyalists</option>
                <option value="At Risk">Khusus Segmen At Risk (Win-back)</option>
                <option value="Hibernating">Khusus Segmen Hibernating</option>
              </select>
            </div>

            {/* Tanggal Mulai & Masa Berlaku */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mulai Aktif:</span>
                </label>
                <input
                  type="date"
                  value={newVoucherStartsAt}
                  onChange={(e) => setNewVoucherStartsAt(e.target.value)}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Durasi:</span>
                </label>
                <select
                  value={newVoucherExpiresDuration}
                  onChange={(e) => setNewVoucherExpiresDuration(e.target.value)}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="7_days">7 Hari ke Depan</option>
                  <option value="14_days">14 Hari (2 Minggu)</option>
                  <option value="30_days">30 Hari (1 Bulan)</option>
                  <option value="custom">Pilih Tanggal Kustom</option>
                </select>
              </div>
            </div>

            {newVoucherExpiresDuration === 'custom' && (
              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Kedaluwarsa:</label>
                <input
                  type="date"
                  value={newVoucherCustomExpiresDate}
                  onChange={(e) => setNewVoucherCustomExpiresDate(e.target.value)}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Min Order & Kuota */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Minimal Belanja (Rp):</label>
                <input
                  type="number"
                  value={newVoucherMinOrder}
                  onChange={(e) => setNewVoucherMinOrder(Number(e.target.value))}
                  step={10000}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Kuota Kupon:</label>
                <input
                  type="number"
                  value={newVoucherUsageLimit}
                  onChange={(e) => setNewVoucherUsageLimit(Number(e.target.value))}
                  min={1}
                  className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingVoucher}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSavingVoucher ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Kupon...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simpan &amp; Aktifkan Voucher ke Toko</span>
                </>
              )}
            </button>
          </form>

          {/* Daftar Kartu Voucher Aktif Toko (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Daftar Voucher Aktif Toko ({storeVouchers.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Siap divalidasi di In-App Checkout</span>
            </div>

            {loadingVouchers ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span className="text-xs">Memuat daftar voucher...</span>
              </div>
            ) : storeVouchers.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-2">
                <Ticket className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                <p className="text-xs font-semibold text-slate-600">Belum ada kupon aktif di toko Anda.</p>
                <p className="text-[11px] text-slate-400">Gunakan formulir di samping untuk membuat kupon promosi pertama Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {storeVouchers.map((vouch) => {
                  const isCopied = copiedVoucherCode === vouch.code;
                  return (
                    <div
                      key={vouch.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-slate-900 tracking-wider">
                            {vouch.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(vouch.code);
                              setCopiedVoucherCode(vouch.code);
                              toast.success(`Kode ${vouch.code} disalin!`);
                              setTimeout(() => setCopiedVoucherCode(null), 2000);
                            }}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Salin Kode Kupon"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {vouch.discount_type === 'percent' ? `Diskon ${vouch.discount_value}%` : `Hemat Rp ${vouch.discount_value.toLocaleString('id-ID')}`}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                        {vouch.target_segment && (
                          <div className="flex items-center justify-between">
                            <span>Target:</span>
                            <span className="font-semibold text-slate-700">{vouch.target_segment}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Masa Berlaku:</span>
                          <span className="font-mono text-slate-700">
                            {vouch.expires_at ? new Date(vouch.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Selamanya'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Min. Belanja:</span>
                          <span className="font-semibold text-slate-700">{formatIDR(vouch.min_order_amount || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pemakaian:</span>
                          <span className="font-semibold text-amber-700">{vouch.times_used || 0} / {vouch.usage_limit} Kuota</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POP-UP 1: Detail Segmen saat Diagram Lingkaran Diklik */}
      {activeSegmentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Pop-up */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${SEGMENT_BADGES[activeSegmentDetail].bg}`}>
                  {React.createElement(SEGMENT_BADGES[activeSegmentDetail].icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="font-outfit font-extrabold text-slate-900 text-lg">
                    Segmen {activeSegmentDetail}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jumlah: <strong className="text-slate-800">{data?.segment_distribution[activeSegmentDetail] || 0} Pelanggan</strong> ({((data?.segment_distribution[activeSegmentDetail] || 0) / (data?.total_customers || 1) * 100).toFixed(0)}% dari total)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSegmentDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Edukasi Segmen */}
            <div className="space-y-3.5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Karakteristik Pembeli:
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {SEGMENT_DESCRIPTIONS[activeSegmentDetail].summary}
                </p>
              </div>

              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rekomendasi Strategi Promosi:</span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  {SEGMENT_DESCRIPTIONS[activeSegmentDetail].action}
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveSegmentDetail(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedSegment(activeSegmentDetail);
                  setActiveSegmentDetail(null);
                  toast.success(`Tabel difilter untuk segmen ${activeSegmentDetail}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Saring Pelanggan Ini di Tabel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POP-UP 2: Detail Riwayat Transaksi Pelanggan */}
      {selectedCustomerForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedCustomerForDetail.avatar_url ? (
                  <img
                    src={selectedCustomerForDetail.avatar_url}
                    alt={selectedCustomerForDetail.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                    {selectedCustomerForDetail.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit font-extrabold text-slate-900 text-lg">
                      {selectedCustomerForDetail.full_name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${SEGMENT_BADGES[selectedCustomerForDetail.segment].bg}`}>
                      {selectedCustomerForDetail.segment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedCustomerForDetail.phone_number || 'Nomor WhatsApp belum terdaftar'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrik Profil Pelanggan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Belanja</span>
                <p className="font-outfit font-extrabold text-slate-900 text-sm sm:text-base">
                  {formatIDR(selectedCustomerForDetail.monetary_total)}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Frekuensi</span>
                <p className="font-outfit font-extrabold text-slate-900 text-sm sm:text-base">
                  {selectedCustomerForDetail.frequency_count} Transaksi
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recency</span>
                <p className="font-outfit font-extrabold text-slate-900 text-sm sm:text-base">
                  {selectedCustomerForDetail.recency_days} hari lalu
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Skor RFM</span>
                <p className="font-outfit font-extrabold text-slate-900 text-sm sm:text-base">
                  {selectedCustomerForDetail.overall_rfm_score} / 5
                </p>
              </div>
            </div>

            {/* Riwayat Transaksi & Produk yang Pernah Dibeli */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-terracotta" />
                <span>Riwayat Pesanan &amp; Produk Dibeli ({(selectedCustomerForDetail.order_history || []).length})</span>
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(selectedCustomerForDetail.order_history || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Belum ada riwayat pesanan yang tercatat.
                  </p>
                ) : (
                  selectedCustomerForDetail.order_history.map((order, idx) => (
                    <div key={order.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="font-outfit font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {formatIDR(order.total_amount)}
                        </span>
                      </div>

                      {/* Items */}
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {order.items.map((item, iIdx) => (
                            <div key={item.id || iIdx} className="flex items-center justify-between text-xs text-slate-600">
                              <span className="font-medium text-slate-800 truncate max-w-[280px]">
                                • {item.product_name} <span className="text-slate-400">x{item.quantity}</span>
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {formatIDR(item.price_per_item * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Rincian produk diarsip.</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomerForDetail(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              {selectedCustomerForDetail.phone_number && (
                <button
                  onClick={() => {
                    const cust = selectedCustomerForDetail;
                    setSelectedCustomerForDetail(null);
                    openWaModal(cust);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Pesan WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL POP-UP 3: Direct WhatsApp Promo Helper */}
      {activeWaCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Direct WhatsApp Promo</h3>
                  <p className="text-xs text-slate-400">Pesan AI terpersonalisasi untuk {activeWaCustomer.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveWaCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">
                Draft Pesan Promosi Segmen ({activeWaCustomer.segment}):
              </label>
              <textarea
                rows={5}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveWaCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <a
                href={`https://wa.me/${activeWaCustomer.phone_number?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
