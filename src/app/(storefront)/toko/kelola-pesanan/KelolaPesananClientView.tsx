'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    CreditCard,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    order_status: 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled' | string;
    payment_status: 'pending' | 'paid' | 'failed' | 'expired' | string;
    payment_method: 'qris' | 'transfer' | 'cash' | string;
    created_at: string;
    order_items?: OrderItem[];
    profiles?: {
        full_name?: string | null;
        phone_number?: string | null;
    } | null;
}

interface KelolaPesananClientViewProps {
    order: OrderData;
    id: string;
    token: string;
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

export default function KelolaPesananClientView({ order, id, token }: KelolaPesananClientViewProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const buyerName = order.profiles?.full_name || 'Pembeli';
    const buyerPhoneRaw = order.profiles?.phone_number || '';
    const buyerPhone62 = formatPhone62(buyerPhoneRaw);

    // Logika Tombol Aksi Berdasarkan order_status dan payment_method (2-Klik untuk Metode Cash)
    let actionType: 'process' | 'cash_complete' | 'ready' | 'complete' | null = null;
    let buttonLabel = '';

    if (order.payment_method === 'cash') {
        if (order.order_status === 'pending') {
            actionType = 'process';
            buttonLabel = 'Terima Pembayaran & Masuk Antrean';
        } else if (order.order_status === 'processing' || order.order_status === 'ready_for_pickup') {
            actionType = 'complete';
            buttonLabel = 'Pesanan Selesai / Diserahkan';
        }
    } else {
        if (order.order_status === 'verifying' || order.order_status === 'pending') {
            actionType = 'process';
            buttonLabel = 'Validasi & Proses Pesanan';
        } else if (order.order_status === 'processing') {
            actionType = 'ready';
            buttonLabel = 'Barang Siap Diambil';
        } else if (order.order_status === 'ready_for_pickup') {
            actionType = 'complete';
            buttonLabel = 'Selesaikan Transaksi';
        }
    }

    const handleActionClick = async () => {
        if (!actionType || isUpdating) return;

        setIsUpdating(true);
        const loadingToast = toast.loading('Memperbarui status pesanan...');

        try {
            const res = await fetch(`/api/wa-action?id=${id}&action=${actionType}&token=${token}`);
            if (!res.ok) {
                throw new Error('Gagal memperbarui status pesanan.');
            }
            toast.success('Status pesanan berhasil diperbarui!', { id: loadingToast });
            router.refresh();
            window.location.reload();
        } catch (err: any) {
            console.error('Error triggering wa-action:', err);
            toast.error(err.message || 'Terjadi kesalahan saat memperbarui status.', { id: loadingToast });
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col justify-between py-6 px-4 sm:px-6">
            <div className="max-w-lg mx-auto w-full my-auto space-y-4">
                {/* Navigation Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-terracotta transition-colors"
                    >
                        <span>&larr; Beranda LORA</span>
                    </Link>
                    <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                        Panel Kontrol Penjual
                    </span>
                </div>

                {/* Main Card Surface */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 space-y-6">
                    {/* Header Short ID */}
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                Kode Pesanan
                            </p>
                            <h1 className="text-xl sm:text-2xl font-outfit font-black text-slate-900">
                                Pesanan: <span className="text-terracotta">{order.short_id || order.id.split('-')[0]}</span>
                            </h1>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 shadow-xs">
                            <Store className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        {/* Status Pesanan */}
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Status Pesanan</p>
                            <div>
                                {order.order_status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
                                        <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Konfirmasi
                                    </span>
                                )}
                                {order.order_status === 'processing' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold">
                                        <Package className="w-3.5 h-3.5 text-blue-700" /> Sedang Diproses
                                    </span>
                                )}
                                {order.order_status === 'ready_for_pickup' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold">
                                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-700" /> Siap Diambil
                                    </span>
                                )}
                                {order.order_status === 'completed' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Pesanan Selesai
                                    </span>
                                )}
                                {order.order_status === 'cancelled' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Dibatalkan
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Pembayaran */}
                        <div className="space-y-0.5 text-right">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Pembayaran</p>
                            <div>
                                {order.payment_status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                                        ✓ Lunas
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold">
                                        ⌛ Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Pembeli */}
                    <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-terracotta" />
                            <span>Informasi Pembeli</span>
                        </p>

                        <div className="flex items-center justify-between pt-1">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-900">{buyerName}</p>
                                <p className="text-xs text-slate-500 font-mono">
                                    {buyerPhoneRaw || 'Tidak ada nomor WhatsApp'}
                                </p>
                            </div>

                            {buyerPhone62 ? (
                                <a
                                    href={`https://wa.me/${buyerPhone62}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>Hubungi WA</span>
                                </a>
                            ) : null}
                        </div>
                    </div>

                    {/* Daftar Barang */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <ShoppingBag className="w-4 h-4 text-terracotta" />
                            <span>Daftar Barang Dipesan</span>
                        </p>

                        <div className="divide-y divide-slate-100 space-y-2">
                            {order.order_items && order.order_items.length > 0 ? (
                                order.order_items.map((item) => (
                                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.products?.image_url ? (
                                                    <img
                                                        src={item.products.image_url}
                                                        alt={item.products.name || 'Produk'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-4 h-4 text-slate-400 stroke-1" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {item.products?.name || 'Produk UMKM'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {item.quantity} x Rp {item.price_per_item.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-slate-800">
                                            Rp {(item.quantity * item.price_per_item).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">Detail barang tidak tersedia.</p>
                            )}
                        </div>

                        {/* Ringkasan Total & Metode */}
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                            <div>
                                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Metode: <strong className="uppercase text-slate-900">{order.payment_method}</strong></span>
                                </p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">Total Harga</p>
                            </div>
                            <p className="text-xl font-outfit font-black text-amber-900">
                                Rp {order.total_amount.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Tombol Aksi Berukuran Besar */}
                    <div className="pt-2">
                        {actionType ? (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                disabled={isUpdating}
                                className="w-full py-4 px-6 bg-terracotta hover:bg-terracotta-hover active:scale-[0.99] disabled:opacity-70 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-terracotta/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                                        <span>Memperbarui Status...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{buttonLabel}</span>
                                        <span className="text-lg">🚀</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <span>Pesanan telah selesai</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="text-center text-xs text-slate-400 pt-6">
                <p>© 2026 LORA Regional Assistant. Seluruh hak cipta dilindungi.</p>
            </footer>
        </div>
    );
}
