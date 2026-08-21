import Link from 'next/link';
import Image from 'next/image';
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
import HeroHpMockup from '@/components/landing/HeroHpMockup';
import CountUp from '@/components/reactbits/CountUp';
import FadeContent from '@/components/reactbits/FadeContent';
import ShapeDivider from '@/components/ui/ShapeDivider';
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

    // Fetch preview produk unggulan (hanya produk aktif & stok > 0, maksimal 8 produk)
    const { data: rawProducts, error } = await supabase
        .from('products')
        .select('*, businesses(name, slug, city_name, province_name)')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8);

    // Fetch count total UMKM (businesses) & total produk aktif (products) dari Supabase untuk statistik dinamis
    const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    const { count: totalProductsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    const statsData = [
        {
            id: 'umkm',
            value: totalBusinesses && totalBusinesses > 0 ? totalBusinesses : 500,
            suffix: '+',
            label: 'UMKM Bergabung',
            separator: '.',
        },
        {
            id: 'produk',
            value: totalProductsCount && totalProductsCount > 0 ? totalProductsCount : 1250,
            suffix: '+',
            label: 'Produk Lokal',
            separator: '.',
        },
        {
            id: 'ai-assistant',
            value: 24,
            suffix: ' Jam',
            label: 'Bantuan Asisten AI',
            separator: '.',
        },
    ];

    // Filter ketat memastikan hanya produk berstok (stock > 0) yang tampil di Landing Page
    const products: ProductWithBusiness[] = (rawProducts || []).filter(p => (p.stock || 0) > 0);

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

            <div suppressHydrationWarning className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden selection:bg-terracotta selection:text-white">
                {/* 1. NAVBAR LANDING PAGE (Guest Structure: LOGO - Solusi | Katalog | SDGs | FAQ - Masuk | Daftar) */}
                <LandingNavbar user={user} profile={profile} />

                <main className="flex-1 pb-20 overflow-x-hidden">
                    {/* 2. HERO SECTION BANNER UTAMA (DARK MODE ELEGAN, POSISI PRESISI FIT ABOVE THE FOLD) */}
                    <div className="relative">
                        <section suppressHydrationWarning className="relative overflow-hidden bg-[#0B1120] text-white min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-90px)] flex items-center py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
                            {/* Background Ambient Decorative Glows */}
                            <div className="absolute top-10 left-10 w-[28rem] h-[28rem] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-terracotta/25 rounded-full blur-3xl pointer-events-none" />

                            <div suppressHydrationWarning className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center w-full">
                                {/* KOLOM KANAN (Gambar Mockup HP max-h-58vh) -> 5-KOLOM DESKTOP */}
                                <div className="order-1 lg:order-2 lg:col-span-5 relative flex justify-center items-center w-full mx-auto">
                                    <HeroHpMockup />
                                </div>

                                {/* KOLOM KIRI (Teks, CTA, & Stats - Ditarik ke Atas Tanpa Extra Margin Top) -> 7-KOLOM DESKTOP */}
                                <div className="order-2 lg:order-1 lg:col-span-7 space-y-2.5 sm:space-y-3.5 lg:space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start m-0 p-0">
                                    {/* H1 Headline (Diet Tipografi: max text-4xl lg:text-[2.75rem]) */}
                                    <FadeContent direction="up" distance={16} duration={850} delay={100} blur className="w-full">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-outfit font-bold tracking-tight leading-tight text-white text-center lg:text-left w-full">
                                            Kembangkan Usaha UMKM Lebih Mudah dengan{' '}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-amber-500 to-amber-400">
                                                Bantuan <i>Artificial Intelligence</i>
                                            </span>
                                        </h1>
                                    </FadeContent>

                                    {/* Subtitle Description (Diet Paragraf: text-xs sm:text-sm lg:text-base) */}
                                    <FadeContent direction="up" distance={14} duration={850} delay={220} className="w-full">
                                        <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed text-center lg:text-left w-full max-w-2xl lg:max-w-none">
                                            Platform dagang cerdas dan Asisten AI untuk membantu pelaku UMKM di segala sektor mengelola etalase toko digital, pengingat stok otomatis, dan strategi bisnis untuk meningkatkan omzet.
                                        </p>
                                    </FadeContent>

                                    {/* Call to Action Button Group (Compact Spacing) */}
                                    <FadeContent direction="up" distance={14} duration={850} delay={340} className="w-full">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-0.5 w-full">
                                            <Link
                                                href="/katalog"
                                                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-gradient-to-r from-terracotta to-amber-600 hover:from-terracotta-hover hover:to-amber-700 text-white rounded-2xl font-outfit font-semibold text-xs sm:text-sm shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                <span>Jelajahi Katalog Produk</span>
                                            </Link>

                                            <Link
                                                href={profile?.is_seller ? "/dashboard" : (user ? "/buka-toko" : "/register")}
                                                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-2xl font-outfit font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                                            >
                                                <Store className="w-4 h-4 text-terracotta" />
                                                <span>{profile?.is_seller ? "Dashboard Toko Saya" : "Buka Toko UMKM Gratis"}</span>
                                            </Link>
                                        </div>
                                    </FadeContent>

                                    {/* 3-Column Dynamic Stats Divider (Compact Typography & Padding) */}
                                    <FadeContent direction="up" distance={14} duration={850} delay={460} className="w-full">
                                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-center lg:text-left w-full">
                                            {statsData.map((stat) => (
                                                <div key={stat.id} className="space-y-0">
                                                    <CountUp
                                                        to={stat.value}
                                                        suffix={stat.suffix}
                                                        separator={stat.separator}
                                                        duration={3.2}
                                                        className="text-lg sm:text-xl font-outfit font-bold text-terracotta block text-center lg:text-left"
                                                    />
                                                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold text-center lg:text-left">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </FadeContent>
                                </div>
                            </div>
                        </section>

                        {/* Wave Shape Divider Overlap: Mengalir langsung dari Hero ke Solusi-Fitur */}
                        <div className="absolute top-full left-0 right-0 w-full pointer-events-none z-20 -mt-[2px]">
                            <ShapeDivider
                                variant="wave"
                                position="bottom"
                                direction="outward"
                                color="text-[#0B1120]"
                                height="h-8 sm:h-12 md:h-16 lg:h-20"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* 3. SECTION MASALAH, SOLUSI & 6 FITUR UTAMA LORA */}
                    <FeaturesSection />

                    {/* SECTION LAINNYA DENGAN SPACING YANG RAPI */}
                    <div className="space-y-16 sm:space-y-24 mt-16 sm:mt-24">
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
                                            className="h-full"
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
                </div>
            </main>

                {/* 8. FOOTER LANDING PAGE */}
                <LandingFooter />
            </div>
        </CartProvider>
    );
}
