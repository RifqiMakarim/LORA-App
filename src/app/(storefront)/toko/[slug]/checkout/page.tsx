'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ShoppingCart,
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    Store,
    CheckCircle2,
    Clock,
    ShieldCheck,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/components/storefront/CartContext';

export default function DedicatedCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = (params?.slug as string) || '';

    const {
        items,
        currentStoreName,
        currentStoreSlug,
        cartTotal,
        totalItemsCount,
        buyerNotes,
        setBuyerNotes,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();

    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

    // State QRIS Dinamis TemanQRIS
    const [isLoadingQris, setIsLoadingQris] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string>('');
    const [qrisError, setQrisError] = useState<string | null>(null);

    const storeTitle = currentStoreName || slug.replace(/-/g, ' ').toUpperCase();

    // Fungsi Fetch ke Internal API Route /api/qris untuk mendapatkan Base64 qr_image
    const fetchQrisData = useCallback(async () => {
        if (cartTotal <= 0) return;

        setIsLoadingQris(true);
        setQrisError(null);

        try {
            const randomOrderId = `LORA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            setOrderId(randomOrderId);

            const res = await fetch('/api/qris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal,
                    orderId: randomOrderId,
                    storeSlug: slug,
                    storeName: storeTitle,
                }),
            });

            const data = await res.json();

            if (data.success && data.qr_image) {
                setQrImageUrl(data.qr_image);
            } else {
                setQrisError(data.message || 'Gagal memuat QRIS Dinamis');
                toast.error('Gagal memuat QRIS Dinamis');
            }
        } catch (err) {
            console.error('Gagal memanggil API QRIS:', err);
            setQrisError('Gagal terhubung ke layanan TemanQRIS');
            toast.error('Gagal terhubung ke layanan QRIS');
        } finally {
            setIsLoadingQris(false);
        }
    }, [cartTotal, slug, storeTitle]);

    // Generasi QRIS saat halaman dimuat atau tombol dipicu
    useEffect(() => {
        if (items.length > 0 && cartTotal > 0) {
            fetchQrisData();
        }
    }, [cartTotal, items.length, fetchQrisData]);

    // Countdown Timer Effect
    useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [items.length]);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCompleteOrder = () => {
        setIsPaymentSuccess(true);
        clearCart();
        toast.success('Pembayaran QRIS Berhasil dikonfirmasi!');
        setTimeout(() => {
            router.push(slug ? `/toko/${slug}` : '/');
        }, 2500);
    };

    // If cart is empty, show empty cart UI
    if (items.length === 0 && !isPaymentSuccess) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-outfit font-bold text-slate-900">
                        Keranjang Anda Masih Kosong
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Anda belum memiliki produk di keranjang belanja. Silakan pilih produk dari etalase toko UMKM terlebih dahulu.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href={slug ? `/toko/${slug}` : '/'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white rounded-2xl text-xs font-bold shadow-lg shadow-terracotta/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Katalog Toko</span>
                    </Link>
                </div>
            </div>
        );
    }

    if (isPaymentSuccess) {
        return (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-outfit font-extrabold text-slate-900">
                        Pembayaran QRIS Berhasil! 🎉
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Terima kasih telah berbelanja di <span className="font-bold text-slate-900">{storeTitle}</span> melalui LORA Regional Storefront. Pesanan Anda sedang diproses oleh penjual.
                    </p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium">
                    Keranjang telah dikosongkan. Anda akan secara otomatis dialihkan kembali ke etalase toko...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header Page Title & Back link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                    <Link
                        href={`/toko/${slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-terracotta transition-colors mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Etalase Toko</span>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-outfit font-black text-slate-900 flex items-center gap-2">
                        <span>Checkout Pesanan</span>
                        <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-bold">
                            TemanQRIS Dynamic Payment
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <Store className="w-4 h-4 text-terracotta" />
                    <span>Toko: {storeTitle}</span>
                </div>
            </div>

            {/* Main Split Layout: Left Column Order Items (7 cols), Right Column QRIS Box (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* BAGIAN KIRI: Rincian Pesanan (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-base font-outfit font-bold text-slate-900 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-terracotta" />
                                <span>Rincian Produk ({totalItemsCount} Item)</span>
                            </h2>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Batalkan Pesanan
                            </button>
                        </div>

                        {/* Item List */}
                        <div className="divide-y divide-slate-100 space-y-3">
                            {items.map(({ product, quantity }) => (
                                <div key={product.id} className="pt-3 flex items-center justify-between gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Store className="w-6 h-6 stroke-1" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs font-outfit text-slate-600">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[11px] font-bold text-terracotta">
                                            Subtotal: Rp {(product.price * quantity).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    {/* Stepper & Hapus */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                                className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                                className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(product.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Catatan untuk Penjual */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                        <label className="text-xs font-bold text-slate-800 block">
                            Catatan Khusus untuk Penjual (Opsional):
                        </label>
                        <textarea
                            rows={3}
                            value={buyerNotes}
                            onChange={(e) => setBuyerNotes(e.target.value)}
                            placeholder="Contoh: Tolong dikemas dengan bubble wrap tebal, atau pesan varian rasa cokelat..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Summary Ringkasan Total */}
                    <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-3">
                        <div className="flex justify-between text-xs text-slate-300">
                            <span>Total Harga Produk ({totalItemsCount} item):</span>
                            <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-300">
                            <span>Metode Pembayaran:</span>
                            <span className="font-bold text-amber-400">QRIS Dinamis (TemanQRIS)</span>
                        </div>
                        <div className="flex justify-between text-base font-outfit font-extrabold text-white pt-3 border-t border-slate-800">
                            <span>Total Pembayaran Presisi:</span>
                            <span className="text-amber-400 text-xl font-bold">
                                Rp {cartTotal.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* BAGIAN KANAN: Kotak Pembayaran QRIS Dinamis TemanQRIS (5 Cols) */}
                <div className="lg:col-span-5 space-y-6 sticky top-24">
                    <div className="bg-white p-6 rounded-3xl border-2 border-terracotta/30 shadow-xl space-y-5 text-center relative overflow-hidden">
                        {/* Official QRIS Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-lg tracking-widest font-outfit">
                                    QRIS
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    TemanQRIS Dynamic
                                </span>
                            </div>
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>

                        {/* Merchant Details */}
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                Merchant UMKM
                            </p>
                            <h3 className="text-lg font-outfit font-black text-slate-900">
                                {storeTitle}
                            </h3>
                            {orderId && (
                                <p className="text-[10px] text-slate-500 font-mono">
                                    ID Pesanan: <span className="font-bold text-slate-800">{orderId}</span>
                                </p>
                            )}
                        </div>

                        {/* Area Barcode QRIS / Loading Spinner / Image Base64 Tag */}
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-300 relative max-w-[260px] mx-auto min-h-[240px] flex flex-col items-center justify-center space-y-3 shadow-inner">
                            {isLoadingQris ? (
                                <div className="space-y-3 py-8 flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-slate-700 animate-pulse">
                                        Memuat Gambar QRIS TemanQRIS...
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        Mengambil Base64 dari API Route
                                    </p>
                                </div>
                            ) : qrisError ? (
                                <div className="space-y-3 py-4 text-center">
                                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                                    <p className="text-xs font-bold text-rose-600">{qrisError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchQrisData}
                                        className="px-3 py-1.5 bg-terracotta text-white rounded-xl text-xs font-bold flex items-center gap-1 mx-auto hover:bg-terracotta-hover transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                                    </button>
                                </div>
                            ) : qrImageUrl ? (
                                /* Render Gambar Base64 QRIS Menggunakan Tag <img> */
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                                    <img
                                        src={qrImageUrl}
                                        alt="QRIS Payment"
                                        className="w-48 h-48 object-contain"
                                    />
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-2">
                                        Scan dengan m-Banking / E-Wallet
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {/* Nominal Presisi Harus Dibayar */}
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                            <p className="text-[11px] text-amber-900 font-semibold">
                                Total Nominal Harus Dibayar:
                            </p>
                            <p className="text-2xl font-outfit font-black text-amber-900">
                                Rp {cartTotal.toLocaleString('id-ID')}
                            </p>
                            <div className="flex items-center justify-center gap-1 text-[11px] text-amber-800 font-bold pt-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Batas Waktu Pembayaran: {formatTimer(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Petunjuk Pembayaran QRIS */}
                        <div className="text-left space-y-2 pt-1 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-900">
                                📱 Cara Pembayaran QRIS:
                            </p>
                            <ol className="text-[11px] text-slate-600 space-y-1.5 pl-4 list-decimal">
                                <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, ShopeePay, DANA).</li>
                                <li>Pilih menu <strong>Scan QR / QRIS</strong>.</li>
                                <li>Arahkan kamera ke kode QRIS di atas.</li>
                                <li>Periksa nama merchant <strong>{storeTitle}</strong> & nominal <strong>Rp {cartTotal.toLocaleString('id-ID')}</strong>.</li>
                                <li>Masukkan PIN Anda untuk menyelesaikan transaksi.</li>
                            </ol>
                        </div>

                        {/* Tombol Konfirmasi Selesai */}
                        <button
                            type="button"
                            onClick={handleCompleteOrder}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Konfirmasi Pembayaran Selesai</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
