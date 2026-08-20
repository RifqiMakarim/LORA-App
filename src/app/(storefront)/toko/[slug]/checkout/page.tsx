'use client';

import { useState, useEffect } from 'react';
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
    ShieldCheck,
    AlertCircle,
    CreditCard,
    QrCode,
    Building2,
    Banknote,
    Copy,
    Loader2,
    Ticket,
    Check,
    X,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/components/storefront/CartContext';
import { createOrder } from '@/app/actions/order';
import { supabase } from '@/lib/supabase/client';

interface BusinessPaymentInfo {
    id: string;
    name: string;
    qris_image_url?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
}

interface AppliedVoucherData {
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    discount_amount: number;
    final_total: number;
    starts_at?: string;
    expires_at?: string;
}

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

    const [businessInfo, setBusinessInfo] = useState<BusinessPaymentInfo | null>(null);
    const [isLoadingBusiness, setIsLoadingBusiness] = useState<boolean>(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'qris' | 'transfer' | 'cash'>('cash');
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Voucher State
    const [voucherInput, setVoucherInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucherData | null>(null);
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

    const storeTitle = businessInfo?.name || currentStoreName || slug.replace(/-/g, ' ').toUpperCase();

    // Hitung total efektif setelah diskon voucher
    const discountAmount = appliedVoucher ? appliedVoucher.discount_amount : 0;
    const effectiveTotal = Math.max(0, cartTotal - discountAmount);

    // Guard: Mencegah ketidakcocokan toko pada keranjang aktif
    useEffect(() => {
        if (!isPaymentSuccess && currentStoreSlug && slug && slug !== currentStoreSlug) {
            toast.error('Keranjang aktif berasal dari toko lain. Anda dialihkan ke checkout toko yang benar.');
            router.replace(`/toko/${currentStoreSlug}/checkout`);
        }
    }, [currentStoreSlug, slug, router, isPaymentSuccess]);

    // Fetch data informasi toko (termasuk qris_image_url, bank_name, bank_account_number)
    useEffect(() => {
        async function fetchBusinessPaymentData() {
            if (!slug) return;
            setIsLoadingBusiness(true);
            try {
                const { data, error } = await supabase
                    .from('businesses')
                    .select('id, name, qris_image_url, bank_name, bank_account_number')
                    .eq('slug', slug)
                    .maybeSingle();

                if (data && !error) {
                    setBusinessInfo(data);

                    // Tetapkan default opsi terbaik yang tersedia
                    if (data.qris_image_url) {
                        setSelectedPaymentMethod('qris');
                    } else if (data.bank_account_number) {
                        setSelectedPaymentMethod('transfer');
                    } else {
                        setSelectedPaymentMethod('cash');
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data pembayaran toko:', err);
            } finally {
                setIsLoadingBusiness(false);
            }
        }
        fetchBusinessPaymentData();
    }, [slug]);

    // Apply Voucher Handler
    const handleApplyVoucher = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const codeToValidate = voucherInput.trim().toUpperCase();
        if (!codeToValidate) {
            toast.error('Silakan ketikkan kode voucher terlebih dahulu');
            return;
        }

        setIsValidatingVoucher(true);
        try {
            const res = await fetch('/api/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    code: codeToValidate,
                    cart_total: cartTotal,
                }),
            });

            const data = await res.json();
            if (res.ok && data.valid && data.voucher) {
                setAppliedVoucher(data.voucher);
                toast.success(data.message || `Voucher ${codeToValidate} berhasil digunakan!`);
            } else {
                toast.error(data.message || 'Kode voucher tidak valid atau tidak dapat digunakan.');
            }
        } catch (err) {
            console.error('Error applying voucher:', err);
            toast.error('Gagal memvalidasi voucher. Periksa koneksi Anda.');
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput('');
        toast.success('Voucher diskon dibatalkan');
    };

    // Submit Order Handler
    const handleCompleteOrder = async () => {
        if (isSubmittingOrder) return;
        setIsSubmittingOrder(true);
        const loadingToastId = toast.loading('Memproses konfirmasi pesanan...');

        try {
            const result = await createOrder({
                storeSlug: slug,
                business_id: businessInfo?.id,
                totalAmount: effectiveTotal,
                paymentMethod: selectedPaymentMethod,
                items: items.map((i) => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    price_per_item: i.product.price,
                })),
            });

            if (result.error) {
                toast.error(result.error, { id: loadingToastId });
                setIsSubmittingOrder(false);
                return;
            }

            setIsPaymentSuccess(true);
            clearCart();
            toast.success('Pesanan berhasil dibuat!', { id: loadingToastId });
            setTimeout(() => {
                router.push(slug ? `/toko/${slug}` : '/');
            }, 2500);
        } catch (err: any) {
            console.error('Gagal membuat pesanan:', err);
            toast.error('Terjadi kesalahan saat memproses pesanan.', { id: loadingToastId });
            setIsSubmittingOrder(false);
        }
    };

    // Jika keranjang kosong
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
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white rounded-2xl text-xs font-bold shadow-lg shadow-terracotta/20 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </button>
                </div>
            </div>
        );
    }

    // Layar Sukses Pesanan
    if (isPaymentSuccess) {
        return (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-outfit font-extrabold text-slate-900">
                        Pesanan Berhasil Dibuat! 🎉
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Terima kasih telah berbelanja di <span className="font-bold text-slate-900">{storeTitle}</span> melalui LORA Regional Storefront. Pesanan Anda telah diteruskan ke penjual.
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
            {/* Header Title & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-terracotta transition-colors mb-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-outfit font-black text-slate-900">
                        Checkout Pesanan
                    </h1>
                </div>

                <Link
                    href={`/toko/${slug}`}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-orange-50/90 hover:text-terracotta px-4 py-2 rounded-2xl border border-slate-200 hover:border-terracotta shadow-xs w-fit cursor-pointer transition-all active:scale-95 group"
                    title={`Kunjungi Toko ${storeTitle}`}
                >
                    <Store className="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform" />
                    <span>Toko: {storeTitle}</span>
                </Link>
            </div>

            {/* Main Split Layout: Left Column (7 cols), Right Column (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* BAGIAN KIRI: Rincian Pesanan & Pilihan Metode Pembayaran (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* List Produk */}
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

                                    <div className="flex-1 min-w-0 overflow-hidden space-y-1">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs font-outfit text-slate-600 truncate">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[11px] font-bold text-terracotta truncate">
                                            Subtotal: Rp {(product.price * quantity).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    {/* Quantity Stepper */}
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
                                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VOUCHER / KUPON PROMO SECTION */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-base font-outfit font-bold text-slate-900 flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-terracotta" />
                                <span>Kupon Promo &amp; Diskon Toko</span>
                            </h2>
                            {appliedVoucher && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    Voucher Terpasang
                                </span>
                            )}
                        </div>

                        {appliedVoucher ? (
                            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-extrabold text-emerald-900 tracking-wider text-sm">
                                            {appliedVoucher.code}
                                        </span>
                                        <span className="text-xs bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-lg">
                                            {appliedVoucher.discount_type === 'percent' ? `Hemat ${appliedVoucher.discount_value}%` : `Potongan Rp ${appliedVoucher.discount_value.toLocaleString('id-ID')}`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-medium">
                                        Hemat Rp {appliedVoucher.discount_amount.toLocaleString('id-ID')} untuk transaksi ini
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveVoucher}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Hapus Voucher"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleApplyVoucher} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Ticket className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Masukkan kode promo"
                                        value={voucherInput}
                                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isValidatingVoucher || !voucherInput.trim()}
                                    className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                >
                                    {isValidatingVoucher ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <span>Gunakan</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* PILIH METODE PEMBAYARAN (3 OPSI) */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base font-outfit font-bold text-slate-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-terracotta" />
                                <span>Pilih Metode Pembayaran</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                Pilih metode pembayaran langsung (P2P / Kasir) yang disediakan oleh toko
                            </p>
                        </div>

                        {isLoadingBusiness ? (
                            <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                                <span className="text-xs font-semibold">Memuat opsi pembayaran toko...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Opsi A: QRIS (Tampilkan hanya jika qris_image_url ada) */}
                                {businessInfo?.qris_image_url && (
                                    <label
                                        onClick={() => setSelectedPaymentMethod('qris')}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${selectedPaymentMethod === 'qris'
                                            ? 'border-terracotta bg-amber-50/50 shadow-md ring-2 ring-terracotta/20'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="qris"
                                                checked={selectedPaymentMethod === 'qris'}
                                                onChange={() => setSelectedPaymentMethod('qris')}
                                                className="accent-terracotta"
                                            />
                                            <QrCode className="w-5 h-5 text-terracotta" />
                                            <span className="text-xs font-bold text-slate-900">QRIS</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Scan QR Code</span>
                                    </label>
                                )}

                                {/* Opsi B: Transfer Bank (Tampilkan hanya jika bank_account_number ada) */}
                                {businessInfo?.bank_account_number && (
                                    <label
                                        onClick={() => setSelectedPaymentMethod('transfer')}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${selectedPaymentMethod === 'transfer'
                                            ? 'border-terracotta bg-amber-50/50 shadow-md ring-2 ring-terracotta/20'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="transfer"
                                                checked={selectedPaymentMethod === 'transfer'}
                                                onChange={() => setSelectedPaymentMethod('transfer')}
                                                className="accent-terracotta"
                                            />
                                            <Building2 className="w-5 h-5 text-terracotta" />
                                            <span className="text-xs font-bold text-slate-900">Transfer Bank</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {businessInfo.bank_name || 'Bank'}
                                        </span>
                                    </label>
                                )}

                                {/* Opsi C: Bayar di Kasir (WAJIB SELALU ADA) */}
                                <label
                                    onClick={() => setSelectedPaymentMethod('cash')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${selectedPaymentMethod === 'cash'
                                        ? 'border-terracotta bg-amber-50/50 shadow-md ring-2 ring-terracotta/20'
                                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cash"
                                            checked={selectedPaymentMethod === 'cash'}
                                            onChange={() => setSelectedPaymentMethod('cash')}
                                            className="accent-terracotta"
                                        />
                                        <Banknote className="w-5 h-5 text-terracotta" />
                                        <span className="text-xs font-bold text-slate-900">Bayar di Kasir</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium">Tunai di Tempat</span>
                                </label>
                            </div>
                        )}
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
                            placeholder="Contoh: Tolong dikemas dengan bubble wrap tebal, atau pesan varian motif batik..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Summary Ringkasan Total */}
                    <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-3">
                        <div className="flex justify-between items-center gap-3 text-xs text-slate-300 min-w-0 overflow-hidden">
                            <span className="flex-shrink-0">Total Harga Produk ({totalItemsCount} item):</span>
                            <span className="font-semibold text-slate-200 truncate break-all max-w-full">Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>

                        {appliedVoucher && (
                            <div className="flex justify-between items-center gap-3 text-xs text-emerald-400 font-semibold min-w-0 overflow-hidden">
                                <span className="flex-shrink-0">Diskon Kupon ({appliedVoucher.code}):</span>
                                <span className="truncate max-w-full">- Rp {appliedVoucher.discount_amount.toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center gap-3 text-xs text-slate-300 min-w-0 overflow-hidden">
                            <span className="flex-shrink-0">Metode Pembayaran Terpilih:</span>
                            <span className="font-bold text-amber-400 capitalize truncate max-w-full">
                                {selectedPaymentMethod === 'qris'
                                    ? 'QRIS Toko'
                                    : selectedPaymentMethod === 'transfer'
                                        ? `Transfer Bank (${businessInfo?.bank_name || ''})`
                                        : 'Bayar di Kasir (Tunai)'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center gap-3 text-base font-outfit font-extrabold text-white pt-3 border-t border-slate-800 min-w-0 overflow-hidden">
                            <span className="flex-shrink-0">Total Pembayaran:</span>
                            <span className="text-amber-400 text-xl font-bold truncate break-all max-w-full">
                                Rp {effectiveTotal.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* BAGIAN KANAN: Kotak Tampilan Kondisional Metode Pembayaran (5 Cols) */}
                <div className="lg:col-span-5 space-y-6 sticky top-24">
                    {selectedPaymentMethod === 'qris' && (
                        <div className="bg-white p-6 rounded-3xl border-2 border-terracotta/30 shadow-xl space-y-4 text-center">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-lg tracking-widest font-outfit">
                                        QRIS
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Kode QRIS Toko
                                    </span>
                                </div>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                    Merchant Toko
                                </p>
                                <h3 className="text-lg font-outfit font-black text-slate-900">
                                    {storeTitle}
                                </h3>
                            </div>

                            {/* Gambar QRIS Toko */}
                            {businessInfo?.qris_image_url ? (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-[260px] mx-auto flex flex-col items-center justify-center space-y-2 shadow-inner">
                                    <img
                                        src={businessInfo.qris_image_url}
                                        alt="Kode QRIS Toko"
                                        className="w-52 h-52 object-contain bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                        Scan via m-Banking / E-Wallet
                                    </span>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-2xl border border-amber-200">
                                    Gambar QRIS toko tidak tersedia.
                                </div>
                            )}

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center space-y-1 min-w-0 overflow-hidden">
                                <p className="text-[11px] text-amber-900 font-semibold">Total Tagihan QRIS:</p>
                                <p className="text-2xl font-outfit font-black text-amber-900 truncate break-all max-w-full">
                                    Rp {effectiveTotal.toLocaleString('id-ID')}
                                </p>
                                {appliedVoucher && (
                                    <p className="text-[10px] text-emerald-700 font-bold">
                                        *Hemat Rp {appliedVoucher.discount_amount.toLocaleString('id-ID')} dengan kupon {appliedVoucher.code}
                                    </p>
                                )}
                            </div>

                            {/* Tombol Konfirmasi Pesanan */}
                            <button
                                type="button"
                                onClick={handleCompleteOrder}
                                disabled={isSubmittingOrder}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                            >
                                {isSubmittingOrder ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Memproses Pesanan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Konfirmasi Pembayaran Selesai</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {selectedPaymentMethod === 'transfer' && (
                        <div className="bg-white p-6 rounded-3xl border-2 border-terracotta/30 shadow-xl space-y-5 text-center">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-terracotta" />
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Transfer Bank
                                    </span>
                                </div>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>

                            <div className="space-y-1 text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                    Bank Tujuan ({businessInfo?.bank_name || 'Bank'})
                                </p>
                                <h3 className="text-xl font-outfit font-black text-slate-900">
                                    {businessInfo?.bank_name || 'Bank'}
                                </h3>
                            </div>

                            {/* Detail Rekening & Tombol Salin */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <div className="space-y-1 min-w-0 overflow-hidden">
                                    <p className="text-[11px] text-slate-500 font-medium">Nomor Rekening:</p>
                                    <p className="text-xl font-mono font-black text-slate-900 tracking-wider truncate break-all max-w-full">
                                        {businessInfo?.bank_account_number || '-'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (businessInfo?.bank_account_number) {
                                            navigator.clipboard.writeText(businessInfo.bank_account_number);
                                            toast.success('Nomor rekening berhasil disalin!');
                                        }
                                    }}
                                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    <Copy className="w-3.5 h-3.5 text-terracotta" />
                                    <span>Salin Nomor Rekening</span>
                                </button>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center space-y-1 min-w-0 overflow-hidden">
                                <p className="text-[11px] text-amber-900 font-semibold">Total Transfer:</p>
                                <p className="text-2xl font-outfit font-black text-amber-900 truncate break-all max-w-full">
                                    Rp {effectiveTotal.toLocaleString('id-ID')}
                                </p>
                                {appliedVoucher && (
                                    <p className="text-[10px] text-emerald-700 font-bold">
                                        *Hemat Rp {appliedVoucher.discount_amount.toLocaleString('id-ID')} dengan kupon {appliedVoucher.code}
                                    </p>
                                )}
                            </div>

                            {/* Tombol Konfirmasi Pesanan */}
                            <button
                                type="button"
                                onClick={handleCompleteOrder}
                                disabled={isSubmittingOrder}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                            >
                                {isSubmittingOrder ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Memproses Pesanan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Konfirmasi Pembayaran Transfer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {selectedPaymentMethod === 'cash' && (
                        <div className="bg-white p-6 rounded-3xl border-2 border-terracotta/30 shadow-xl space-y-5 text-center">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-terracotta" />
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Bayar di Kasir (Tunai)
                                    </span>
                                </div>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>

                            {/* Kotak Instruksi Kasir */}
                            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-left">
                                <div className="flex items-start gap-2 text-amber-900">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold">Instruksi Pembayaran Kasir:</p>
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                            Silakan tunjukkan nomor pesanan ini ke kasir untuk melakukan pembayaran tunai dan mengambil pesanan Anda.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1 min-w-0 overflow-hidden">
                                <p className="text-[11px] text-slate-500 font-semibold">Total Tagihan Tunai:</p>
                                <p className="text-2xl font-outfit font-black text-slate-900 truncate break-all max-w-full">
                                    Rp {effectiveTotal.toLocaleString('id-ID')}
                                </p>
                                {appliedVoucher && (
                                    <p className="text-[10px] text-emerald-700 font-bold">
                                        *Hemat Rp {appliedVoucher.discount_amount.toLocaleString('id-ID')} dengan kupon {appliedVoucher.code}
                                    </p>
                                )}
                            </div>

                            {/* Tombol Buat Pesanan Kasir */}
                            <button
                                type="button"
                                onClick={handleCompleteOrder}
                                disabled={isSubmittingOrder}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                            >
                                {isSubmittingOrder ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Memproses Pesanan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Buat Pesanan &amp; Bayar di Kasir</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}