'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag,
    User,
    MessageCircle,
    CheckCircle2,
    Clock,
    Package,
    ArrowRight,
    Loader2,
    Store,
    AlertCircle,
    Sparkles,
    Search,
    Ban,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rejectOrder } from '@/app/actions/order';

interface OrderItem {
    id: string;
    quantity: number;
    price_per_item: number;
    product_id?: string | null;
    products?: {
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
}

interface OrderData {
    id: string;
    short_id?: string | null;
    wa_token?: string | null;
    business_id: string;
    customer_id?: string | null;
    total_amount: number;
    order_status: 'pending' | 'verifying' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled' | string;
    payment_status: 'pending' | 'paid' | 'failed' | 'expired' | string;
    payment_method: 'qris' | 'transfer' | 'cash' | string;
    created_at: string;
    order_items?: OrderItem[];
    profiles?: {
        full_name?: string | null;
        phone_number?: string | null;
    } | null;
}

interface SellerOrdersClientViewProps {
    orders: OrderData[];
    businessName: string;
    highlight?: string;
}

function formatPhone62(phone?: string | null): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62') && cleaned.length > 0) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

export default function SellerOrdersClientView({
    orders,
    businessName,
    highlight,
}: SellerOrdersClientViewProps) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State untuk Modal Tolak Pesanan Kustom
    const [selectedOrderToReject, setSelectedOrderToReject] = useState<OrderData | null>(null);
    const [isRejecting, setIsRejecting] = useState<boolean>(false);

    // Scroll to View (Client Side): Otomatis scroll ke elemen yang di-highlight saat dimuat
    useEffect(() => {
        if (highlight) {
            const element = document.getElementById(`order-${highlight}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlight]);

    // Handle Aksi Perubahan Status Pesanan (State Machine)
    const handleActionClick = async (order: OrderData, actionType: string) => {
        if (updatingId || !order.wa_token) return;

        setUpdatingId(order.id);
        const loadingToast = toast.loading('Memperbarui status pesanan...');

        try {
            const res = await fetch(
                `/api/wa-action?id=${order.id}&action=${actionType}&token=${order.wa_token}`
            );

            if (!res.ok) {
                throw new Error('Gagal memperbarui status pesanan.');
            }

            toast.success('Status pesanan berhasil diperbarui!', { id: loadingToast });
            router.refresh();
        } catch (err: any) {
            console.error('Error updating order:', err);
            toast.error(err.message || 'Terjadi kesalahan sistem.', { id: loadingToast });
        } finally {
            setUpdatingId(null);
        }
    };

    // Handle Aksi Penolakan Pesanan Penjual
    const handleConfirmReject = async () => {
        if (!selectedOrderToReject || isRejecting) return;

        setIsRejecting(true);
        const loadingToast = toast.loading('Menolak pesanan...');

        try {
            const res = await rejectOrder(selectedOrderToReject.id);

            if (res.error) {
                throw new Error(res.error);
            }

            toast.success('Pesanan berhasil ditolak', { id: loadingToast });
            setSelectedOrderToReject(null);
            router.refresh();
        } catch (err: any) {
            console.error('Gagal menolak pesanan:', err);
            toast.error(err.message || 'Gagal menolak pesanan', { id: loadingToast });
        } finally {
            setIsRejecting(false);
        }
    };

    // Filter Pesanan
    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            filterStatus === 'all' || order.order_status === filterStatus;
        const shortIdMatch = (order.short_id || '').toLowerCase().includes(searchQuery.toLowerCase());
        const buyerNameMatch = (order.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const idMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && (shortIdMatch || buyerNameMatch || idMatch);
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
                            <Store className="w-3.5 h-3.5" />
                            <span>{businessName}</span>
                        </div>
                        <h1 className="text-2xl font-outfit font-black text-slate-900 tracking-tight">
                            Manajemen Pesanan Toko
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Kelola alur transaksi pesanan pembeli secara langsung
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Total:</span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-sm font-black">
                            {orders.length} Pesanan
                        </span>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari ID pesanan / pembeli..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 no-scrollbar">
                        {[
                            { key: 'all', label: 'Semua' },
                            { key: 'verifying', label: 'Verifikasi' },
                            { key: 'pending', label: 'Menunggu' },
                            { key: 'processing', label: 'Diproses' },
                            { key: 'ready_for_pickup', label: 'Siap Diambil' },
                            { key: 'completed', label: 'Selesai' },
                            { key: 'cancelled', label: 'Dibatalkan' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterStatus(tab.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    filterStatus === tab.key
                                        ? 'bg-terracotta text-white shadow-md shadow-terracotta/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Pesanan */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 stroke-1" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Tidak Ada Pesanan Ditemukan</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada pesanan yang sesuai dengan filter atau pencarian Anda.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const isHighlighted = order.id === highlight;
                        const buyerName = order.profiles?.full_name || 'Pembeli';
                        const buyerPhoneRaw = order.profiles?.phone_number || '';
                        const buyerPhone62 = formatPhone62(buyerPhoneRaw);

                        // State Machine Logika Tombol Aksi (Dinamis per Metode & Status)
                        let actionType: string | null = null;
                        let buttonLabel = '';
                        let buttonColorClass = '';

                        if (order.payment_method === 'cash') {
                            if (order.order_status === 'pending') {
                                actionType = 'process';
                                buttonLabel = 'Terima Pembayaran & Masuk Antrean';
                                buttonColorClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
                            } else if (order.order_status === 'processing' || order.order_status === 'ready_for_pickup') {
                                actionType = 'complete';
                                buttonLabel = 'Pesanan Selesai / Diserahkan';
                                buttonColorClass = 'bg-blue-600 hover:bg-blue-700 text-white';
                            }
                        } else {
                            if (order.order_status === 'verifying' || order.order_status === 'pending') {
                                actionType = 'process';
                                buttonLabel = 'Validasi & Proses Pesanan';
                                buttonColorClass = 'bg-terracotta hover:bg-terracotta-hover text-white';
                            } else if (order.order_status === 'processing') {
                                actionType = 'ready';
                                buttonLabel = 'Barang Siap Diambil';
                                buttonColorClass = 'bg-blue-600 hover:bg-blue-700 text-white';
                            } else if (order.order_status === 'ready_for_pickup') {
                                actionType = 'complete';
                                buttonLabel = 'Selesaikan Transaksi';
                                buttonColorClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';
                            }
                        }

                        return (
                            <div
                                key={order.id}
                                id={`order-${order.id}`}
                                className={`rounded-3xl p-5 sm:p-6 transition-all duration-500 border ${
                                    isHighlighted
                                        ? 'bg-amber-50/90 border-2 border-amber-500 shadow-2xl ring-4 ring-amber-500/20 animate-pulse'
                                        : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                                }`}
                            >
                                {/* Header Card Pesanan */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-outfit font-black text-slate-900">
                                                Pesanan: <span className="text-terracotta">{order.short_id || order.id.split('-')[0]}</span>
                                            </h2>
                                            {isHighlighted && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white font-extrabold rounded-full text-[10px] uppercase tracking-wider animate-bounce shadow-sm">
                                                    <Sparkles className="w-3 h-3" /> Dipilih Dari WA
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono">
                                            {new Date(order.created_at).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    </div>

                                    {/* Badges Status */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {order.order_status === 'verifying' && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Validasi
                                            </span>
                                        )}
                                        {order.order_status === 'pending' && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending
                                            </span>
                                        )}
                                        {order.order_status === 'processing' && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <Package className="w-3.5 h-3.5 text-blue-700" /> Diproses
                                            </span>
                                        )}
                                        {order.order_status === 'ready_for_pickup' && (
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <ShoppingBag className="w-3.5 h-3.5 text-indigo-700" /> Siap Diambil
                                            </span>
                                        )}
                                        {order.order_status === 'completed' && (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Selesai
                                            </span>
                                        )}
                                        {order.order_status === 'cancelled' && (
                                            <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Dibatalkan
                                            </span>
                                        )}

                                        <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold uppercase">
                                            {order.payment_method} ({order.payment_status})
                                        </span>
                                    </div>
                                </div>

                                {/* Body Content: Pembeli & Barang */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                    {/* Informasi Pembeli */}
                                    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-terracotta" />
                                            <span>Informasi Pembeli</span>
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{buyerName}</p>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {buyerPhoneRaw || 'Tidak ada nomor'}
                                                </p>
                                            </div>
                                            {buyerPhone62 && (
                                                <a
                                                    href={`https://wa.me/${buyerPhone62}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    <span>WA</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rincian Barang & Total */}
                                    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <ShoppingBag className="w-3.5 h-3.5 text-terracotta" />
                                            <span>Daftar Barang</span>
                                        </p>
                                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                                            {order.order_items && order.order_items.length > 0 ? (
                                                order.order_items.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-xs font-medium text-slate-700">
                                                        <span>{item.products?.name || 'Produk'} ({item.quantity}x)</span>
                                                        <span className="font-bold text-slate-900">Rp {(item.quantity * item.price_per_item).toLocaleString('id-ID')}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">Rincian barang tidak tersedia</p>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-600">Total Pembayaran:</span>
                                            <span className="text-base font-outfit font-black text-slate-900">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Keterangan & Tombol Tindak Lanjut Refund jika Pesanan Dibatalkan (Non-Cash) */}
                                {order.order_status === 'cancelled' && order.payment_method !== 'cash' && (
                                    <div className="mb-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-rose-800 font-medium">
                                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                            <span>
                                                Pesanan dibatalkan. Pastikan dana sudah di-refund jika pembeli sudah transfer.
                                            </span>
                                        </div>
                                        {buyerPhone62 && (
                                            <a
                                                href={`https://wa.me/${buyerPhone62}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>Hubungi Pembeli via WA</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Footer Action Buttons */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                                    {/* Tombol Sekunder: Tolak Pesanan (Hanya jika pending / verifying) */}
                                    {(order.order_status === 'pending' || order.order_status === 'verifying') && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrderToReject(order)}
                                            className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Ban className="w-4 h-4 text-rose-600" />
                                            <span>Tolak Pesanan</span>
                                        </button>
                                    )}

                                    {/* Tombol Utama Aksi */}
                                    {actionType ? (
                                        <button
                                            type="button"
                                            onClick={() => handleActionClick(order, actionType!)}
                                            disabled={updatingId === order.id}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${buttonColorClass}`}
                                        >
                                            {updatingId === order.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{buttonLabel}</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    ) : order.order_status === 'cancelled' ? (
                                        <span className="px-4 py-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4 text-rose-600" />
                                            <span>Pesanan Dibatalkan</span>
                                        </span>
                                    ) : (
                                        <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>Pesanan Selesai</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Custom Modal/Dialog Konfirmasi Tolak Pesanan */}
            {selectedOrderToReject && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                                <Ban className="w-5 h-5 text-rose-600" />
                                <span>Tolak Pesanan?</span>
                            </h3>
                            <button
                                onClick={() => setSelectedOrderToReject(null)}
                                disabled={isRejecting}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                Apakah Anda yakin ingin menolak pesanan ini? Jika pembeli sudah terlanjur melakukan transfer (QRIS/Manual), Anda <strong className="text-rose-600 uppercase">WAJIB</strong> menghubungi pembeli dan mengembalikan dana (Refund) secara manual.
                            </p>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                                <p className="font-bold text-slate-900">
                                    ID Pesanan: <span className="text-terracotta">{selectedOrderToReject.short_id || selectedOrderToReject.id.split('-')[0]}</span>
                                </p>
                                <p className="text-slate-600">
                                    Pembeli: <span className="font-bold text-slate-800">{selectedOrderToReject.profiles?.full_name || 'Pembeli'}</span>
                                </p>
                                <p className="text-slate-600">
                                    Total: <span className="font-black text-slate-900">Rp {selectedOrderToReject.total_amount.toLocaleString('id-ID')}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedOrderToReject(null)}
                                disabled={isRejecting}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                disabled={isRejecting}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {isRejecting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menolak...</span>
                                    </>
                                ) : (
                                    <span>Ya, Tolak Pesanan</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
