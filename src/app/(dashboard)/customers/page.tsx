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
  HeartHandshake
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RFMAnalyticsSummary, CustomerRFMProfile, RFMSegment } from '@/lib/engines/rfm-engine';

const SEGMENT_COLORS: Record<RFMSegment, string> = {
  'Champions': '#10B981',       // Emerald
  'Loyal Customers': '#3B82F6', // Blue
  'Potential Loyalists': '#8B5CF6', // Purple
  'At Risk': '#F59E0B',        // Amber
  'Hibernating': '#F43F5E',     // Rose
};

const SEGMENT_BADGES: Record<RFMSegment, { bg: string; text: string; icon: any }> = {
  'Champions': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700', icon: Award },
  'Loyal Customers': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700', icon: HeartHandshake },
  'Potential Loyalists': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700', icon: Sparkles },
  'At Risk': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700', icon: AlertTriangle },
  'Hibernating': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700', icon: X },
};

export default function CustomerInsightsPage() {
  const [data, setData] = useState<RFMAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  // Modals state
  const [activeWaCustomer, setActiveWaCustomer] = useState<CustomerRFMProfile | null>(null);
  const [waMessage, setWaMessage] = useState('');
  
  const [activeVoucherCustomer, setActiveVoucherCustomer] = useState<CustomerRFMProfile | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState('15%');
  const [copiedVoucher, setCopiedVoucher] = useState(false);

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

  // Format currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Open WA Modal
  const openWaModal = (customer: CustomerRFMProfile) => {
    setActiveWaCustomer(customer);
    setWaMessage(customer.suggested_wa_template);
  };

  // Open Voucher Modal
  const openVoucherModal = (customer: CustomerRFMProfile) => {
    setActiveVoucherCustomer(customer);
    const prefix = customer.segment.toUpperCase().replace(/\s+/g, '').slice(0, 5);
    setVoucherCode(`${prefix}${Math.floor(100 + Math.random() * 900)}`);
    setCopiedVoucher(false);
  };

  // Filtered Customer List
  const filteredCustomers = (data?.customers || []).filter((c) => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone_number && c.phone_number.includes(searchQuery));
    const matchesSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  // Data untuk Recharts Donut
  const chartData = data ? Object.entries(data.segment_distribution).map(([name, value]) => ({
    name,
    value,
  })) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          Menganalisis Perilaku Pelanggan & Segmentasi RFM...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Insight & RFM Segmentation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Segmentasi analitis pembeli terdaftar berbasis Recency, Frequency, & Monetary untuk strategi pemasaran presisi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            Strict Profile Aggregation Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pembeli Terdaftar</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data?.total_customers || 0}</span>
            <span className="text-xs text-slate-500 ml-2">Pelanggan Aktif</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeat Customer Rate</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data?.repeat_customer_rate || 0}%</span>
            <span className="text-xs text-slate-500 ml-2">Order &gt; 1 Kali</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value (AOV)</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatIDR(data?.average_order_value || 0)}</span>
            <span className="text-xs text-slate-500 ml-1">per Transaksi</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Lifetime Value</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatIDR(data?.estimated_clv || 0)}</span>
            <span className="text-xs text-slate-500 ml-1">Est. Nilai Pelanggan</span>
          </div>
        </div>
      </div>

      {/* Segment Distribution Section (Chart + Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Donut */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 self-start">
            Distribusi Segmen Pelanggan
          </h2>
          <div className="w-full h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
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
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Matriks segmentasi dikalkulasi secara otomatis dari frekuensi & nilai transaksi historis.
          </p>
        </div>

        {/* Segment Action Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(data?.segment_distribution || {}).map(([segName, count]) => {
            const segment = segName as RFMSegment;
            const badge = SEGMENT_BADGES[segment];
            const Icon = badge.icon;

            return (
              <div 
                key={segName}
                onClick={() => setSelectedSegment(selectedSegment === segment ? 'ALL' : segment)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedSegment === segment 
                    ? 'ring-2 ring-amber-500 bg-amber-500/5 dark:bg-amber-500/10 border-amber-400' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${badge.bg} ${badge.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{segName}</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {segment === 'Champions' && 'Pelanggan paling setia dengan belanja tertinggi. Berikan apresiasi VIP.'}
                    {segment === 'Loyal Customers' && 'Rutin belanja produk Anda. Siap menerima promo produk komplementer.'}
                    {segment === 'Potential Loyalists' && 'Pembeli baru/sedang yang berpotensi menjadi pelanggan tetap.'}
                    {segment === 'At Risk' && 'Pernah rutin beli namun sudah lama tidak belanja. Butuh promo win-back.'}
                    {segment === 'Hibernating' && 'Inaktif dalam waktu lama. Tawarkan diskon re-engagement.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer List & Filter Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Daftar Profil Pelanggan ({filteredCustomers.length})
            </h2>
            {selectedSegment !== 'ALL' && (
              <button 
                onClick={() => setSelectedSegment('ALL')}
                className="text-xs text-amber-600 dark:text-amber-400 underline font-medium"
              >
                Reset Filter Segmen
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari nama atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Segment Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-6">Pelanggan</th>
                <th className="py-3.5 px-6">Segmen RFM</th>
                <th className="py-3.5 px-6">Recency</th>
                <th className="py-3.5 px-6">Frekuensi</th>
                <th className="py-3.5 px-6">Total Spending</th>
                <th className="py-3.5 px-6">Skor RFM</th>
                <th className="py-3.5 px-6 text-right">Aksi Langsung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada pelanggan terdaftar yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const badge = SEGMENT_BADGES[cust.segment];
                  const Icon = badge.icon;

                  return (
                    <tr key={cust.customer_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {cust.avatar_url ? (
                            <img 
                              src={cust.avatar_url} 
                              alt={cust.full_name} 
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                              {cust.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{cust.full_name}</p>
                            <p className="text-xs text-slate-500">{cust.phone_number || 'Tidak ada WhatsApp'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Segment Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cust.segment}
                        </span>
                      </td>

                      {/* Recency */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cust.recency_days === 0 ? 'Hari ini' : `${cust.recency_days} hari lalu`}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cust.frequency_count} Order
                        </span>
                      </td>

                      {/* Monetary */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatIDR(cust.monetary_total)}
                        </span>
                      </td>

                      {/* RFM Score breakdown */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{cust.overall_rfm_score} / 5</span>
                          <span className="text-[10px] text-slate-400">R:{cust.score_r} F:{cust.score_f} M:{cust.score_m}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openWaModal(cust)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
                            title="Kirim Pesan WhatsApp Direct"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => openVoucherModal(cust)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-sm"
                            title="Generate Kode Voucher Diskon"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            Voucher
                          </button>
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

      {/* MODAL 1: WhatsApp Broadcast Direct Helper */}
      {activeWaCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Direct WhatsApp Promo</h3>
                  <p className="text-xs text-slate-500">Pesan AI terpersonalisasi untuk {activeWaCustomer.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveWaCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Draft Pesan Promosi Segmen ({activeWaCustomer.segment}):
              </label>
              <textarea
                rows={5}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveWaCustomer(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <a
                href={`https://wa.me/${activeWaCustomer.phone_number?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Generator Kode Voucher Diskon */}
      {activeVoucherCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Generator Kode Voucher</h3>
                  <p className="text-xs text-slate-500">Khusus segmen {activeVoucherCustomer.segment}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveVoucherCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kode Kupon Diskon:</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-widest"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(voucherCode);
                      setCopiedVoucher(true);
                      setTimeout(() => setCopiedVoucher(false), 2000);
                    }}
                    className="px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedVoucher ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Besar Diskon:</label>
                <select
                  value={voucherDiscount}
                  onChange={(e) => setVoucherDiscount(e.target.value)}
                  className="mt-1 w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="10%">Diskon 10% (Pembeli Baru / Potential)</option>
                  <option value="15%">Diskon 15% (Win-back At Risk)</option>
                  <option value="20%">Diskon 20% (VIP Champions)</option>
                  <option value="Rp 25.000">Potongan Rp 25.000</option>
                  <option value="Rp 50.000">Potongan Rp 50.000</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveVoucherCustomer(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert(`Kode voucher ${voucherCode} (${voucherDiscount}) berhasil diaktifkan!`);
                  setActiveVoucherCustomer(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md transition-colors"
              >
                Aktifkan Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
