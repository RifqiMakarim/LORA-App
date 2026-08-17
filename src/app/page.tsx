import Link from 'next/link';
import {
    Sparkles,
    ShoppingBag,
    Store,
    QrCode,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    MessageCircle,
    PackageX,
    ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import StorefrontNavbar from '@/components/storefront/StorefrontNavbar';
import { CartProvider } from '@/components/storefront/CartContext';
import ProductCard from '@/components/storefront/ProductCard';
import { Toaster } from 'react-hot-toast';

interface BusinessRel {
    name: string;
    slug: string;
    city_name?: string | null;
    province_name?: string | null;
}

interface ProductWithBusiness {
    id: string;
    business_id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    price: number;
    stock: number;
    image_url?: string | null;
    is_active?: boolean | null;
    created_at?: string;
    businesses: BusinessRel | BusinessRel[] | null;
}

/**
 * Landing Page Utama Aplikasi LORA (Root Landing Page: /)
 * Server Component yang mengambil preview produk aktif dari Supabase
 */
export default async function LandingPage() {
    const supabase = await createClient();

    // Fetch user & profile untuk Navbar
    const { data: { user } } = await supabase.auth.getUser();
    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        profile = data;
    }

    // Fetch preview produk unggulan (maksimal 8 produk)
    const { data: rawProducts, error } = await supabase
        .from('products')
        .select('*, businesses(name, slug, city_name, province_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

    const products: ProductWithBusiness[] = rawProducts || [];

    const getBusiness = (b: BusinessRel | BusinessRel[] | null): BusinessRel | null => {
        if (!b) return null;
        if (Array.isArray(b)) return b[0] || null;
        return b;
    };

    return (
        <CartProvider initialUser={user}>
            <div suppressHydrationWarning>
                <Toaster position="top-right" reverseOrder={false} />
            </div>

            <div suppressHydrationWarning className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-terracotta selection:text-white">
                {/* Navbar Header Utama */}
                <StorefrontNavbar user={user} profile={profile} />

                <main className="flex-1 space-y-16 sm:space-y-24 pb-16">
                    {/* 1. HERO SECTION BANNER UTAMA */}
                    <section suppressHydrationWarning className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white pt-12 sm:pt-20 pb-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                        {/* Background Decorative Glow Elements */}
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div suppressHydrationWarning className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                            {/* Left Hero Content */}
                            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Pemberdayaan UMKM Regional DIY & Jateng</span>
                                </div>

                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-outfit font-black tracking-tight leading-tight">
                                    Pemberdayaan UMKM <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Regional DIY & Jawa Tengah</span>
                                </h1>

                                <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    Platform E-Commerce & Asisten AI Regional untuk menghubungkan pembeli langsung dengan pengrajin batik, produsen oleh-oleh kuliner, dan pelaku UMKM lokal berdaya saing tinggi.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                                    <Link
                                        href="/katalog"
                                        className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-terracotta to-amber-600 hover:from-terracotta-hover hover:to-amber-700 text-white rounded-2xl font-outfit font-bold text-sm sm:text-base shadow-xl shadow-terracotta/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Jelajahi Katalog Produk</span>
                                    </Link>

                                    <Link
                                        href={profile?.is_seller ? "/dashboard" : (user ? "/buka-toko" : "/login")}
                                        className="w-full sm:w-auto px-7 py-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-2xl font-outfit font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    >
                                        <Store className="w-5 h-5 text-amber-400" />
                                        <span>{profile?.is_seller ? "Dashboard Toko Saya" : "Mulai Jualan UMKM"}</span>
                                    </Link>
                                </div>

                                {/* Key Highlights Metric Badges */}
                                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                                    <div className="space-y-1">
                                        <p className="text-xl sm:text-2xl font-outfit font-black text-amber-400">500+</p>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">UMKM Terverifikasi</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl sm:text-2xl font-outfit font-black text-amber-400">10.000+</p>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Produk Autentik</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl sm:text-2xl font-outfit font-black text-amber-400">100%</p>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">QRIS Dinamis Instant</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Hero Visual Card */}
                            <div className="lg:col-span-5 relative hidden sm:block">
                                <div className="relative mx-auto max-w-sm rounded-3xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta to-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                                                L
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">Asisten LORA AI</p>
                                                <p className="text-[10px] text-amber-400 font-semibold">Online • Siap Membantu</p>
                                            </div>
                                        </div>
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    </div>

                                    <div className="space-y-3 text-xs">
                                        <div className="p-3 bg-slate-800/90 rounded-2xl text-slate-300 border border-slate-700">
                                            💡 "Selamat datang di LORA! Temukan batik Solo autentik & oleh-oleh khas Jogja langsung dari pengrajinnya."
                                        </div>
                                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-300 border border-amber-500/30 font-medium flex items-center gap-2">
                                            <QrCode className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <span>Bayar mudah via QRIS Dinamis TemanQRIS di semua toko!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. SECTION FITUR KEUNGGULAN (SPLIT GRID UNTUK PEMBELI & PENJUAL) */}
                    <section suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
                        <div className="text-center space-y-3 max-w-2xl mx-auto">
                            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                Ecogreen & Smart Omni-channel
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-outfit font-extrabold text-slate-900">
                                Keunggulan Platform LORA
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600">
                                Dirancang khusus untuk memberikan pengalaman belanja yang transparan bagi pembeli dan kemudahan pengelolaan usaha bagi penjual UMKM.
                            </p>
                        </div>

                        {/* Split Grid Card Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {/* FITUR UNTUK PEMBELI */}
                            <div suppressHydrationWarning className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="p-3 bg-amber-500/10 text-terracotta rounded-2xl">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">Untuk Pembeli</h3>
                                        <p className="text-xs text-slate-500">Kemudahan & Keamanan Berbelanja Produk Lokal</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-xs sm:text-sm">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Produk Autentik Regional</p>
                                            <p className="text-slate-500 text-xs">Jaminan produk batik tulis, ukiran, dan kuliner asli pengrajin DIY & Jateng.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <QrCode className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Pembayaran QRIS Instant</p>
                                            <p className="text-slate-500 text-xs">Bayar secara presisi via m-Banking atau E-Wallet menggunakan barcode QRIS Dinamis.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MessageCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Komunikasi Penjual via WhatsApp</p>
                                            <p className="text-slate-500 text-xs">Tanyakan stok dan pesanan khusus langsung kepada pemilik toko secara cepat.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FITUR UNTUK PENJUAL */}
                            <div suppressHydrationWarning className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">Untuk Penjual (UMKM)</h3>
                                        <p className="text-xs text-slate-500">Digitalisasi & Manajemen Usaha Efisien</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-xs sm:text-sm">
                                    <div className="flex items-start gap-3">
                                        <Store className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Etalase Publik Digital</p>
                                            <p className="text-slate-500 text-xs">Dapatkan halaman etalase toko unik dengan URL khusus untuk dibagikan ke calon pembeli.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Otomatisasi Stok & Notifikasi ROP</p>
                                            <p className="text-slate-500 text-xs">Pantau batas Reorder Point (ROP) agar Anda tidak pernah kehabisan stok barang.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Pencairan QRIS Langsung</p>
                                            <p className="text-slate-500 text-xs">Integrasi TemanQRIS memastikan transaksi otomatis tercatat aman dan presisi.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. SECTION PREVIEW KATALOG PRODUK (SERVER COMPONENT FETCH) */}
                    <section suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-terracotta uppercase tracking-wider">
                                    Katalog Produk Terbaru
                                </span>
                                <h2 className="text-xl sm:text-3xl font-outfit font-extrabold text-slate-900">
                                    Preview Produk Unggulan
                                </h2>
                            </div>

                            <Link
                                href="/katalog"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta hover:text-terracotta-hover transition-colors"
                            >
                                <span>Lihat Semua Produk</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Status Kosong / Grid Card Preview Produk */}
                        {(!products || products.length === 0 || error) ? (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                                <PackageX className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-800">Belum Ada Produk Tersedia</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Produk unggulan UMKM Daerah Istimewa Yogyakarta & Jawa Tengah akan segera ditampilkan.
                                </p>
                            </div>
                        ) : (
                            <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                                {products.map((product) => {
                                    const business = getBusiness(product.businesses);
                                    const storeSlug = business?.slug || 'toko';
                                    const storeName = business?.name || 'Toko UMKM';
                                    const locationName = business?.city_name || business?.province_name || 'DIY & Jateng';

                                    return (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            storeSlug={storeSlug}
                                            storeName={storeName}
                                            locationName={locationName}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Button Lihat Semua Produk */}
                        <div className="text-center pt-4">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-outfit font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-terracotta/20 transition-all hover:scale-[1.02]"
                            >
                                <span>Lihat Semua Produk di Katalog</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                </main>

                {/* 4. FOOTER LANDING PAGE */}
                <footer suppressHydrationWarning className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
                    <div suppressHydrationWarning className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
                        <div className="md:col-span-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-terracotta to-amber-500 flex items-center justify-center text-white font-black text-sm">
                                    L
                                </div>
                                <span className="text-lg font-outfit font-black text-white">LORA Regional Assistant</span>
                            </div>
                            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                                Platform E-Commerce & Asisten AI Pemberdayaan UMKM Regional Daerah Istimewa Yogyakarta & Jawa Tengah.
                            </p>
                        </div>

                        <div className="md:col-span-3 space-y-2 text-xs">
                            <p className="font-bold text-white uppercase tracking-wider">Navigasi Utama</p>
                            <ul className="space-y-1.5">
                                <li>
                                    <Link href="/katalog" className="hover:text-amber-400 transition-colors">Katalog Produk</Link>
                                </li>
                                <li>
                                    <Link href={user ? "/buka-toko" : "/login"} className="hover:text-amber-400 transition-colors">Buka Toko UMKM</Link>
                                </li>
                                <li>
                                    <Link href="/login" className="hover:text-amber-400 transition-colors">Masuk Akun</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-2 text-xs">
                            <p className="font-bold text-white uppercase tracking-wider">Bantuan & Informasi</p>
                            <ul className="space-y-1.5">
                                <li><span>Regional DIY & Jawa Tengah</span></li>
                                <li><span>LORA AI Customer Support</span></li>
                                <li><span>Integrasi QRIS TemanQRIS</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                        <p>© 2026 LORA Regional Assistant. Seluruh Hak Cipta Dilindungi.</p>
                        <p>Pemberdayaan Ekonomi Lokal Berbasis Teknologi AI</p>
                    </div>
                </footer>
            </div>
        </CartProvider>
    );
}
