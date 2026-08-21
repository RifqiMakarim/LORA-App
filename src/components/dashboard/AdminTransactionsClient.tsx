'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Package,
  Store,
  User,
  Phone,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  X,
  CreditCard,
  Calendar,
  Filter
} from 'lucide-react';

export interface OrderProductItem {
  id: string;
  quantity: number;
  pricePerItem: number;
  productName: string;
  productImage?: string | null;
}

export interface AdminTransactionItem {
  id: string;
  shortId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  businessName: string;
  businessSlug: string;
  businessCity: string;
  businessProvince: string;
  businessContact: string;
  itemsCount: number;
  items: OrderProductItem[];
}

interface AdminTransactionsClientProps {
  transactions: AdminTransactionItem[];
}

const ITEMS_PER_PAGE = 10;

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);
}

function getPaymentBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase rounded-lg">
          <CheckCircle2 className="w-3 h-3" />
          Lunas
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase rounded-lg">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold uppercase rounded-lg">
          <XCircle className="w-3 h-3" />
          Gagal
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-extrabold uppercase rounded-lg">
          <AlertCircle className="w-3 h-3" />
          Kedaluwarsa
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg">
          {status}
        </span>
      );
  }
}

function getOrderBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg">
          Selesai
        </span>
      );
    case 'processing':
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-lg">
          Diproses
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-lg">
          Siap Diambil
        </span>
      );
    case 'verifying':
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg">
          Verifikasi
        </span>
      );
    case 'cancelled':
    case 'canceled':
      return (
        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg">
          Dibatalkan
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-lg">
          Menunggu
        </span>
      );
  }
}

export default function AdminTransactionsClient({ transactions }: AdminTransactionsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransactionItem | null>(null);

  // Metrics Calculation
  const totalTransactionsCount = transactions.length;
  const paidTransactions = transactions.filter((t) => t.paymentStatus === 'paid');
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const averageOrderValue = paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0;
  const pendingOrdersCount = transactions.filter((t) => t.orderStatus === 'pending' || t.paymentStatus === 'pending').length;

  // Filter and Sort
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        t.shortId.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search) ||
        t.customerName.toLowerCase().includes(search) ||
        t.customerPhone.includes(search) ||
        t.businessName.toLowerCase().includes(search) ||
        t.businessCity.toLowerCase().includes(search);

      if (!matchSearch) return false;

      // Payment Filter
      if (paymentFilter !== 'all' && t.paymentStatus.toLowerCase() !== paymentFilter.toLowerCase()) {
        return false;
      }

      // Order Filter
      if (orderFilter !== 'all' && t.orderStatus.toLowerCase() !== orderFilter.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.totalAmount - a.totalAmount;
      }
      return 0;
    });
  }, [transactions, searchTerm, paymentFilter, orderFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handlePaymentFilterChange = (val: string) => {
    setPaymentFilter(val);
    setCurrentPage(1);
  };

  const handleOrderFilterChange = (val: string) => {
    setOrderFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
            Riwayat Semua Transaksi Platform
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
            Audit arus kas perdagangan seluruh UMKM di platform LORA, status pembayaran QRIS, dan rincian transaksi pembeli secara real-time.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Omzet */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Omzet Lunas</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{formatCurrency(totalRevenue)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidTransactions.length} transaksi sukses</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Semua Transaksi */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Pesanan</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{totalTransactionsCount} Transaksi</h3>
            <span className="text-[10px] text-indigo-600 font-bold">Semua kanal toko</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Rata-rata Keranjang (AOV) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Rata-rata Order (AOV)</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{formatCurrency(averageOrderValue)}</h3>
            <span className="text-[10px] text-slate-500 font-bold">Per transaksi terbayar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Pending / Perlu Diproses */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pesanan Pending</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{pendingOrdersCount} Pesanan</h3>
            <span className="text-[10px] text-amber-600 font-bold">Menunggu pembayaran/proses</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan, pembeli, toko, kota..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pembayaran */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Bayar:</span>
              <select
                value={paymentFilter}
                onChange={(e) => handlePaymentFilterChange(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="pending">Pending</option>
                <option value="failed">Gagal</option>
                <option value="expired">Kedaluwarsa</option>
              </select>
            </div>

            {/* Filter Pesanan */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Proses:</span>
              <select
                value={orderFilter}
                onChange={(e) => handleOrderFilterChange(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">Semua Alur</option>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="ready_for_pickup">Siap Diambil</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {/* Urutan */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-700 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="highest">Nominal Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID Pesanan</th>
                <th className="p-3.5">Pembeli</th>
                <th className="p-3.5">Toko UMKM</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Pembayaran</th>
                <th className="p-3.5">Status Pesanan</th>
                <th className="p-3.5">Waktu Transaksi</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-slate-900">{t.shortId}</p>
                      <p className="text-[9px] font-mono text-slate-400 truncate max-w-[110px]" title={t.id}>
                        {t.id.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{t.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{t.customerPhone}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{t.businessName}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-terracotta" />
                        <span>{t.businessCity}</span>
                      </p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{formatCurrency(t.totalAmount)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t.itemsCount} item produk ({t.paymentMethod.toUpperCase()})
                      </p>
                    </td>
                    <td className="p-3.5">
                      {getPaymentBadge(t.paymentStatus)}
                    </td>
                    <td className="p-3.5">
                      {getOrderBadge(t.orderStatus)}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                      <p className="font-bold text-slate-700">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </p>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-semibold">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada transaksi yang cocok dengan kriteria pencarian dan filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800">{startIndex + 1}</span> - <span className="font-bold text-slate-800">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)}</span> dari <span className="font-bold text-slate-800">{filteredTransactions.length}</span> transaksi
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    return Math.abs(page - safeCurrentPage) <= 1 || page === 1 || page === totalPages;
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const isGap = prevPage && page - prevPage > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {isGap && <span className="text-xs text-slate-400 px-1">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            safeCurrentPage === page
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-outfit font-black text-slate-900">
                    Rincian Pesanan {selectedTransaction.shortId}
                  </h3>
                  {getPaymentBadge(selectedTransaction.paymentStatus)}
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  ID: {selectedTransaction.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer & Store Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pembeli */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Data Pembeli</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">{selectedTransaction.customerName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedTransaction.customerPhone}</span>
                </p>
              </div>

              {/* Toko */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Store className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Toko UMKM</span>
                  </div>
                  <Link
                    href={`/toko/${selectedTransaction.businessSlug}`}
                    target="_blank"
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Etalase</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
                <p className="font-bold text-slate-800 text-sm">{selectedTransaction.businessName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-terracotta flex-shrink-0" />
                  <span className="truncate">{selectedTransaction.businessCity}, {selectedTransaction.businessProvince}</span>
                </p>
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Item Produk yang Dipesan ({selectedTransaction.items.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                {selectedTransaction.items.length > 0 ? (
                  selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.quantity} x {formatCurrency(item.pricePerItem)}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">
                        {formatCurrency(item.quantity * item.pricePerItem)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Rincian produk tidak tersedia untuk pesanan ini.
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-white uppercase">{selectedTransaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Status Pesanan</span>
                <span className="font-bold text-white capitalize">{selectedTransaction.orderStatus}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Waktu Dibuat</span>
                <span className="font-bold text-white">
                  {new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">Total Tagihan</span>
                <span className="font-outfit font-black text-lg text-emerald-400">
                  {formatCurrency(selectedTransaction.totalAmount)}
                </span>
              </div>
            </div>

            {/* Modal Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
