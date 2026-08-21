'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ShoppingBag,
    Store,
    Clock,
    CheckCircle2,
    Package,
    AlertCircle,
    ArrowRight,
    CreditCard,
    Copy,
    Check,
    X,
    ExternalLink,
    Ban,
    Search,
    Filter,
    ZoomIn,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { cancelOrder } from '@/app/actions/order';
import Pagination from '@/components/ui/Pagination';

interface OrderItem {
    id: string;
    quantity: number;
    price_per_item: number;
    products?: {
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
}

interface Business {
    id: string;
    name: string;
    slug?: string | null;
    qris_image_url?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
}

interface OrderData {
    id: string;
    short_id?: string | null;
    customer_id?: string | null;
    business_id: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    businesses?: Business | null;
    order_items?: OrderItem[];
}

interface UserOrdersClientViewProps {
    orders: OrderData[];
}

export default function UserOrdersClientView({ orders }: UserOrdersClientViewProps) {
    const router = useRouter();
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderData | null>(null);
    const [copied, setCopied] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Filter & Search Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const ITEMS_PER_PAGE = 8;

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatusFilter(status);
        setCurrentPage(1);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Nomor rekening berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Fungsi Aksi Pembatalan Pesanan Pembeli (SweetAlert2 Modal Alert)
    const handleCancelOrder = async (orderId: string) => {
        const result = await Swal.fire({
            title: 'Batalkan Pesanan?',
            text: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48', // rose-600
            cancelButtonColor: '#64748B', // slate-500
            confirmButtonText: 'Ya, Batalkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-3xl font-sans p-6',
                confirmButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
                cancelButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
            },
        });

        if (!result.isConfirmed) return;

        setCancellingId(orderId);

        try {
            const res = await cancelOrder(orderId);
            if (res?.error) {
                throw new Error(res.error);
            }

            await Swal.fire({
                title: 'Pesanan Dibatalkan!',
                text: 'Pesanan Anda telah berhasil dibatalkan.',
                icon: 'success',
                confirmButtonColor: '#D97706',
                customClass: {
                    popup: 'rounded-3xl font-sans p-6',
                    confirmButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
                },
            });

            router.refresh();
        } catch (err: any) {
            Swal.fire({
                title: 'Gagal Membatalkan',
                text: err.message || 'Gagal membatalkan pesanan.',
                icon: 'error',
                confirmButtonColor: '#E11D48',
                customClass: {
                    popup: 'rounded-3xl font-sans p-6',
                    confirmButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
                },
            });
        } finally {
            setCancellingId(null);
        }
    };

    // Handler Unduh QRIS Toko
    const handleDownloadOrderQris = async (qrisUrl: string, storeName?: string) => {
        if (!qrisUrl) return;
        try {
            const response = await fetch(qrisUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QRIS-${(storeName || 'Toko').replace(/[^a-zA-Z0-9]/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Gambar QRIS berhasil diunduh');
        } catch {
            window.open(qrisUrl, '_blank');
        }
    };

    // Hitung Jumlah Pesanan per Status untuk Badge Counter Filter Tabs
    const getCountForStatus = (status: string) => {
        if (status === 'all') return orders.length;
        return orders.filter((o) => o.order_status === status).length;
    };

    const STATUS_FILTER_OPTIONS = [
        { value: 'all', label: 'Semua', count: getCountForStatus('all') },
        { value: 'pending', label: 'Menunggu Pembayaran', count: getCountForStatus('pending') },
        { value: 'verifying', label: 'Menunggu Konfirmasi', count: getCountForStatus('verifying') },
        { value: 'processing', label: 'Diproses', count: getCountForStatus('processing') },
        { value: 'ready_for_pickup', label: 'Siap Diambil', count: getCountForStatus('ready_for_pickup') },
        { value: 'completed', label: 'Selesai', count: getCountForStatus('completed') },
        { value: 'cancelled', label: 'Dibatalkan', count: getCountForStatus('cancelled') },
    ];

    // Logika Filter & Pencarian Pesanan
    const filteredOrders = orders.filter((order) => {
        // 1. Filter Status Pesanan
        if (selectedStatusFilter !== 'all' && order.order_status !== selectedStatusFilter) {
            return false;
        }

        // 2. Filter Pencarian Query (Nama Toko, Short ID, atau Nama Produk)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const storeName = (order.businesses?.name || '').toLowerCase();
            const shortId = (order.short_id || '').toLowerCase();
            const orderId = (order.id || '').toLowerCase();
            const hasMatchingProduct = order.order_items?.some((item) =>
                (item.products?.name || '').toLowerCase().includes(query)
            );

            return (
                storeName.includes(query) ||
                shortId.includes(query) ||
                orderId.includes(query) ||
                hasMatchingProduct
            );
        }

        return true;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 pt-6">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
                {/* Navigation Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div>
                        <span className="text-[11px] bg-terracotta/10 text-terracotta font-bold px-2.5 py-0.5 rounded-full">
                            Pelanggan LORA
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-outfit font-black text-slate-900 tracking-tight mt-1">
                            Riwayat Pesanan Saya
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Daftar transaksi dan status pesanan belanja Anda di toko UMKM
                        </p>
                    </div>

                    <Link
                        href="/katalog"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                        <span>Belanja Lagi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* FILTER STATUS & PENCARIAN PESANAN */}
                {orders.length > 0 && (
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                        {/* Search Input Field */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari toko, nama produk, atau ID pesanan..."
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all font-medium"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Tabs (Scrollable Horizontal Bar) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                            {STATUS_FILTER_OPTIONS.map((tab) => {
                                const isActive = selectedStatusFilter === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => handleStatusFilterChange(tab.value)}
                                        className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isActive
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                                isActive
                                                    ? 'bg-slate-800 text-amber-400 font-extrabold'
                                                    : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* State Kosong Total (Jika Belum Pernah Bertransaksi) */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center space-y-5 my-8">
                        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                            <ShoppingBag className="w-10 h-10 stroke-1.5" />
                        </div>
                        <div className="space-y-1.5 max-w-sm mx-auto">
                            <h2 className="text-lg font-bold text-slate-900">Belum Ada Riwayat Pesanan</h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Yuk, mulai belanja dan jelajahi berbagai produk olahan lokal UMKM favorit Anda!
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-2xl text-xs font-bold shadow-lg shadow-terracotta/25 transition-all cursor-pointer"
                            >
                                <span>Mulai Belanja</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    /* State Hasil Pencarian / Filter Kosong */
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Pesanan Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-400">
                            Tidak ada pesanan yang cocok dengan kata kunci pencarian atau status filter terpilih.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedStatusFilter('all');
                            }}
                            className="text-xs font-bold text-terracotta hover:underline cursor-pointer pt-1"
                        >
                            Reset Filter & Pencarian
                        </button>
                    </div>
                ) : (
                    /* Mapping List Card Pesanan */
                    <div className="space-y-4">
                        {paginatedOrders.map((order) => {
                            const storeName = order.businesses?.name || 'Toko UMKM';
                            const formattedDate = new Date(order.created_at).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            });

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/40 p-5 sm:p-6 space-y-4 hover:shadow-lg transition-all"
                                >
                                    {/* Header Card */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200/80 flex-shrink-0">
                                                <Store className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                                        {storeName}
                                                    </h3>
                                                    {order.short_id && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md font-bold">
                                                            {order.short_id}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex items-center gap-2">
                                            {order.order_status === 'verifying' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-900 border border-orange-300 rounded-xl text-xs font-bold">
                                                    <Clock className="w-3.5 h-3.5 text-orange-700" /> Menunggu Konfirmasi
                                                </span>
                                            )}
                                            {order.order_status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
                                                    <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Pembayaran
                                                </span>
                                            )}
                                            {order.order_status === 'processing' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold">
                                                    <Package className="w-3.5 h-3.5 text-blue-700" /> Sedang Diproses
                                                </span>
                                            )}
                                            {order.order_status === 'ready_for_pickup' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-700" /> Siap Diambil
                                                </span>
                                            )}
                                            {order.order_status === 'completed' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Selesai
                                                </span>
                                            )}
                                            {order.order_status === 'cancelled' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Dibatalkan
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ringkasan Daftar Barang */}
                                    <div className="space-y-2 py-1">
                                        {order.order_items && order.order_items.length > 0 ? (
                                            order.order_items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-xs font-medium">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                            {item.products?.name || 'Produk UMKM'}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500">
                                                            {item.quantity} x Rp {item.price_per_item.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="text-xs sm:text-sm font-black text-slate-900">
                                                            Rp {(item.quantity * item.price_per_item).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Rincian produk tidak tersedia</p>
                                        )}
                                    </div>

                                    {/* Footer Kartu: Tanggal + Total Belanja + Tombol Aksi */}
                                    <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                                {new Date(order.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            {/* Total Belanja */}
                                            <div className="text-left sm:text-right">
                                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Pesanan</span>
                                                <span className="text-sm sm:text-base font-black text-terracotta">
                                                    Rp {order.total_amount.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {/* Tombol Sekunder & Utama Aksi */}
                                            <div className="flex items-center gap-2">
                                                {/* Tombol Sekunder: Batalkan Pesanan (Hanya jika pending / verifying) */}
                                                {(order.order_status === 'pending' || order.order_status === 'verifying') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={cancellingId === order.id}
                                                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                                                        <span>{cancellingId === order.id ? 'Membatalkan...' : 'Batalkan Pesanan'}</span>
                                                    </button>
                                                )}

                                                {/* Tombol Lihat Instruksi Pembayaran (jika pending & bukan cash) */}
                                                {order.order_status === 'pending' && order.payment_method !== 'cash' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedOrderForPayment(order)}
                                                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <span>Instruksi Pembayaran</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Komponen Paginasi */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={filteredOrders.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    itemLabel="pesanan"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Instruksi Pembayaran */}
            {selectedOrderForPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-amber-700" />
                                <span>Instruksi Pembayaran</span>
                            </h3>
                            <button
                                onClick={() => setSelectedOrderForPayment(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: QRIS / Bank Transfer */}
                        {selectedOrderForPayment.payment_method === 'qris' && (
                            <div className="text-center space-y-4">
                                <p className="text-xs text-slate-600 font-medium">
                                    Silakan pindai (scan) Kode QRIS di bawah ini untuk menyelesaikan pembayaran:
                                </p>
                                {selectedOrderForPayment.businesses?.qris_image_url ? (
                                    <div className="space-y-3">
                                        <div className="w-full max-w-[320px] mx-auto bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden p-2.5 sm:p-3 shadow-inner flex flex-col items-center">
                                            <div className="w-full bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                                                <img
                                                    src={selectedOrderForPayment.businesses.qris_image_url}
                                                    alt="QRIS Toko"
                                                    className="w-full h-auto min-h-[200px] max-h-[320px] object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Download QRIS Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadOrderQris(
                                                selectedOrderForPayment.businesses!.qris_image_url!,
                                                selectedOrderForPayment.businesses?.name
                                            )}
                                            className="w-full max-w-[320px] mx-auto py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Unduh Gambar QRIS</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl text-xs font-bold">
                                        Gambar QRIS tidak tersedia untuk toko ini.
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedOrderForPayment.payment_method === 'transfer' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-600 font-medium">
                                    Silakan lakukan transfer bank ke rekening toko berikut:
                                </p>
                                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                                    <p className="text-xs text-slate-500 font-bold uppercase">
                                        Bank: <span className="text-slate-900 font-black">{selectedOrderForPayment.businesses?.bank_name || '-'}</span>
                                    </p>
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                                        <span className="font-mono text-sm font-bold text-slate-900">
                                            {selectedOrderForPayment.businesses?.bank_account_number || '-'}
                                        </span>
                                        {selectedOrderForPayment.businesses?.bank_account_number && (
                                            <button
                                                onClick={() => handleCopy(selectedOrderForPayment.businesses!.bank_account_number!)}
                                                className="p-1.5 text-xs font-bold text-terracotta hover:bg-terracotta/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                <span>Salin</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 text-center">
                            <p className="text-xs font-bold text-slate-700">Total Pembayaran:</p>
                            <p className="text-xl font-outfit font-black text-amber-900 mt-0.5">
                                Rp {selectedOrderForPayment.total_amount.toLocaleString('id-ID')}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedOrderForPayment(null)}
                            className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
