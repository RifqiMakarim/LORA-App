import Link from 'next/link';
import {
    Sparkles,
    ShoppingBag,
    Store,
    ArrowRight,
    PackageX,
    ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AiAssistantShowcaseSection from '@/components/landing/AiAssistantShowcaseSection';
import SDGsSection from '@/components/landing/SDGsSection';
import FAQSection from '@/components/landing/FAQSection';
import LandingFooter from '@/components/landing/LandingFooter';
import { CartProvider } from '@/components/storefront/CartContext';
import ProductCard from '@/components/storefront/ProductCard';
import CountUp from '@/components/reactbits/CountUp';
import FadeContent from '@/components/reactbits/FadeContent';
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
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const { data: businessData } = await supabase
            .from('businesses')
            .select('id, name, slug')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (profileData) {
            profile = { ...profileData };
            // Jika user memiliki toko terdaftar tapi is_seller masih false/null, perbaiki statusnya
            if (businessData && !profile.is_seller) {
                profile.is_seller = true;
                supabase
                    .from('profiles')
                    .update({ is_seller: true, updated_at: new Date().toISOString() })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('[LandingPage] Auto-sync profile is_seller error:', error);
                    });
            }
        }
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
                {/* 1. NAVBAR LANDING PAGE (Guest Structure: LOGO - Solusi | Katalog | SDGs | FAQ - Masuk | Daftar) */}
                <LandingNavbar user={user} profile={profile} />

                <main className="flex-1 space-y-16 sm:space-y-24 pb-20">
                    {/* 2. HERO SECTION BANNER UTAMA */}
                    <section suppressHydrationWarning className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white pt-14 sm:pt-24 pb-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                        {/* Background Decorative Glow Elements */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div suppressHydrationWarning className="max-w-4xl mx-auto relative z-10 text-center space-y-7 sm:space-y-8">
                            {/* Regional Badge with Fade */}
                            <FadeContent direction="up" distance={16} duration={1000} blur>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Pemberdayaan UMKM Regional DIY & Jawa Tengah</span>
                                </div>
                            </FadeContent>

                            {/* Headline with Fade */}
                            <FadeContent direction="up" distance={24} duration={1100} delay={150} blur>
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-outfit font-black tracking-tight leading-tight">
                                    Kembangkan Usaha UMKM Lebih Mudah dengan{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                                        Bantuan Kecerdasan Buatan
                                    </span>
                                </h1>
                            </FadeContent>

                            {/* Subtitle with Fade */}
                            <FadeContent direction="up" distance={20} duration={1000} delay={300}>
                                <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
                                    Platform dagang cerdas dan Asisten AI untuk membantu pelaku UMKM di segala sektor mengelola etalase toko digital, pengingat stok otomatis, dan strategi bisnis untuk meningkatkan omzet.
                                </p>
                            </FadeContent>

                            {/* CTA Buttons with Fade */}
                            <FadeContent direction="up" distance={20} duration={1000} delay={450}>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                                    <Link
                                        href="/katalog"
                                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-terracotta to-amber-600 hover:from-terracotta-hover hover:to-amber-700 text-white rounded-2xl font-outfit font-bold text-sm sm:text-base shadow-xl shadow-terracotta/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Jelajahi Katalog Produk</span>
                                    </Link>

                                    <Link
                                        href={profile?.is_seller ? "/dashboard" : (user ? "/buka-toko" : "/register")}
                                        className="w-full sm:w-auto px-8 py-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-2xl font-outfit font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                                    >
                                        <Store className="w-5 h-5 text-amber-400" />
                                        <span>{profile?.is_seller ? "Dashboard Toko Saya" : "Buka Toko UMKM Gratis"}</span>
                                    </Link>
                                </div>
                            </FadeContent>

                            {/* Key Highlights Metric Badges with React Bits CountUp */}
                            <FadeContent direction="up" distance={20} duration={1000} delay={600}>
                                <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-slate-800/80 max-w-md mx-auto">
                                    <div className="space-y-1">
                                        <CountUp to={500} suffix="+" duration={3.2} className="text-xl sm:text-2xl font-outfit font-black text-amber-400 block" />
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">UMKM Bergabung</p>
                                    </div>
                                    <div className="space-y-1">
                                        <CountUp to={1250} suffix="+" duration={3.5} separator="." className="text-xl sm:text-2xl font-outfit font-black text-amber-400 block" />
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Produk Lokal</p>
                                    </div>
                                    <div className="space-y-1">
                                        <CountUp to={24} suffix=" Jam" duration={2.8} className="text-xl sm:text-2xl font-outfit font-black text-amber-400 block" />
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Bantuan Asisten AI</p>
                                    </div>
                                </div>
                            </FadeContent>
                        </div>
                    </section>

                    {/* 3. SECTION MASALAH, SOLUSI & 6 FITUR UTAMA LORA (SEDERHANA & INKLUSIF) */}
                    <FeaturesSection />

                    {/* 4. SECTION PREVIEW KATALOG PRODUK UNGGULAN (SERVER COMPONENT FETCH) */}
                    <section suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
                        {/* Header Katalog Produk with Fade Up */}
                        <FadeContent direction="up" distance={20} duration={900} blur>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta uppercase tracking-wider">
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span>Produk Pilihan UMKM DIY & Jateng</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl font-outfit font-black text-slate-900">
                                        Daftar Katalog Produk Unggulan
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600">
                                        Temukan ragam produk autentik dari berbagai sektor usaha karya pelaku UMKM lokal.
                                    </p>
                                </div>

                                <Link
                                    href="/katalog"
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-terracotta hover:text-terracotta-hover transition-colors"
                                >
                                    <span>Lihat Semua Produk</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </FadeContent>

                        {/* Status Kosong / Grid Card Preview Produk */}
                        {(!products || products.length === 0 || error) ? (
                            <FadeContent direction="up" distance={20} duration={700}>
                                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                                    <PackageX className="w-12 h-12 text-slate-300 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-800">Belum Ada Produk Tersedia</h3>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Produk unggulan UMKM Daerah Istimewa Yogyakarta & Jawa Tengah akan segera ditampilkan di sini.
                                    </p>
                                </div>
                            </FadeContent>
                        ) : (
                            <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                                {products.map((product, idx) => {
                                    const business = getBusiness(product.businesses);
                                    const storeSlug = business?.slug || 'toko';
                                    const storeName = business?.name || 'Toko UMKM';
                                    const locationName = business?.city_name || business?.province_name || 'DIY & Jateng';

                                    return (
                                        <FadeContent
                                            key={product.id}
                                            direction="up"
                                            distance={24}
                                            duration={800}
                                            delay={idx * 100}
                                        >
                                            <ProductCard
                                                product={product}
                                                storeSlug={storeSlug}
                                                storeName={storeName}
                                                locationName={locationName}
                                            />
                                        </FadeContent>
                                    );
                                })}
                            </div>
                        )}

                        {/* Button Besar: Lihat Semua Produk di Katalog with Fade */}
                        <FadeContent direction="up" distance={15} duration={700} delay={200}>
                            <div className="text-center pt-6">
                                <Link
                                    href="/katalog"
                                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-terracotta hover:bg-terracotta-hover text-white font-outfit font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-terracotta/25 transition-all hover:scale-102 cursor-pointer"
                                >
                                    <span>Lihat Semua Produk di Katalog</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </FadeContent>
                    </section>

                    {/* 5. SHOWCASE ASISTEN AI LORA (SETELAH KATALOG PRODUK UNGGULAN) */}
                    <AiAssistantShowcaseSection />

                    {/* 6. SECTION DUKUNGAN SDGS (8, 9, 10, 12) */}
                    <SDGsSection />

                    {/* 7. SECTION FAQ (4 PERTANYAAN DASAR) */}
                    <FAQSection />
                </main>

                {/* 8. FOOTER LANDING PAGE */}
                <LandingFooter />
            </div>
        </CartProvider>
    );
}
