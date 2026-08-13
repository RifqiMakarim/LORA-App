import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import UserProfileDropdown from '@/components/UserProfileDropdown';

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profile = data;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-terracotta selection:text-white flex flex-col justify-between">
            {/* Header Navigation Bar (Konsisten untuk Semua Pengunjung) */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <span className="h-3 w-3 rounded-full bg-terracotta animate-pulse"></span>
                        <span className="text-2xl font-outfit font-bold tracking-tight text-slate-900 group-hover:text-terracotta transition-colors">
                            LORA
                        </span>
                    </Link>

                    {/* Navigation Links: Seragam untuk SEMUA Pengunjung (dengan Guard Login untuk Guest) */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
                        <Link href="/" className="hover:text-terracotta transition-colors">
                            Beranda
                        </Link>

                        {/* Katalog publik - dapat diakses semua pengunjung */}
                        <Link href="/toko/batik-keraton" className="hover:text-terracotta transition-colors">
                            Katalog
                        </Link>

                        {/* Keranjang: Jika logged-in ke cart, jika guest ke login */}
                        <Link
                            href={user ? '#' : '/login'}
                            className="hover:text-terracotta transition-colors"
                        >
                            Keranjang
                        </Link>

                        {/* Riwayat Pesanan: Jika logged-in ke orders, jika guest ke login */}
                        <Link
                            href={user ? '#' : '/login'}
                            className="hover:text-terracotta transition-colors"
                        >
                            Riwayat Pesanan
                        </Link>

                        {/* Buka Toko / Dashboard Toko */}
                        <Link
                            href={user ? (profile?.is_seller ? '/dashboard' : '/buka-toko') : '/login'}
                            className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            {user && profile?.is_seller ? 'Dashboard Toko' : 'Buka Toko'}
                        </Link>
                    </nav>

                    {/* Right User Section */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <UserProfileDropdown user={user} profile={profile} />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-hover rounded-xl shadow-md shadow-terracotta/20 transition-all hover:-translate-y-0.5"
                                >
                                    Daftar Gratis
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Body (3-Way Split Rendering) */}
            <main className="flex-grow">
                {!user ? (
                    /* ========================================================
                       KONDISI A: BELUM LOGIN (!user) -> Public Landing Page
                       ======================================================== */
                    <>
                        {/* Hero Section */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-20 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                                {/* Left Hero Text */}
                                <div className="md:col-span-7 space-y-6">
                                    <span className="inline-block px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs uppercase tracking-wider rounded-full">
                                        Sistem Analisis Bisnis & Etalase Cerdas #1 di DIY & Jawa Tengah
                                    </span>

                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-outfit font-extrabold text-slate-900 leading-tight tracking-tight">
                                        Transformasi Digital UMKM: Dari Pencatatan Otomatis Hingga Keputusan Berbasis AI
                                    </h1>

                                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                                        Memberdayakan pemilik usaha Batik, Kuliner, dan Kerajinan lokal dengan asisten AI yang mengerti pasar regional. Maksimalkan penjualan di setiap momen.
                                    </p>

                                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <Link
                                            href="/register"
                                            className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm rounded-xl shadow-lg shadow-terracotta/25 transition-all text-center hover:-translate-y-0.5"
                                        >
                                            Coba LORA Gratis
                                        </Link>

                                        <Link
                                            href="/toko/batik-keraton"
                                            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all text-center flex items-center justify-center gap-2 hover:border-slate-400 shadow-sm"
                                        >
                                            <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Lihat Demo Storefront
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Visual Card Component */}
                                <div className="md:col-span-5 relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 to-indigo-500/20 rounded-3xl blur-xl opacity-40 animate-pulse"></div>

                                    <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/60 space-y-6">
                                        {/* Gauge Header Mock */}
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Kesehatan Bisnis</p>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-3xl font-outfit font-extrabold text-emerald-600">85</span>
                                                    <span className="text-xs text-slate-400">/100</span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                                                Sangat Sehat
                                            </div>
                                        </div>

                                        {/* Graphic Mock */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Proyeksi Omzet Bulan Ini</span>
                                                <span className="text-emerald-600 font-medium">+38% vs bulan lalu</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-terracotta w-4/5 rounded-full"></div>
                                            </div>
                                        </div>

                                        {/* Floating AI Chip */}
                                        <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3 shadow-sm">
                                            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl text-lg flex-shrink-0">
                                                📋
                                            </span>
                                            <div>
                                                <p className="text-xs font-semibold text-amber-900">Rekomendasi AI Consultant</p>
                                                <p className="text-xs text-slate-700 mt-0.5">
                                                    <strong className="text-slate-900">Restock: +50 Unit</strong> - Persiapan Festival Sekaten Yogyakarta terdekat.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Mengapa Memilih LORA? */}
                        <section id="fitur" className="py-16 bg-white border-t border-slate-200/80">
                            <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
                                <div className="text-center max-w-2xl mx-auto space-y-3">
                                    <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-slate-900">
                                        Mengapa Memilih LORA?
                                    </h2>
                                    <p className="text-slate-600 text-sm sm:text-base">
                                        Solusi terpadu yang dirancang khusus untuk memahami ekosistem bisnis dan kearifan lokal.
                                    </p>
                                </div>

                                {/* 4 Feature Cards Responsive Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white border border-slate-200/80 hover:border-terracotta/50 shadow-sm hover:shadow-md rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-terracotta">
                                            🤖
                                        </div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">AI Consultant</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            Conversational BI didukung Gemini AI. Tanya jawab tentang data bisnis Anda semudah mengobrol dengan asisten pribadi.
                                        </p>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 hover:border-terracotta/50 shadow-sm hover:shadow-md rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-terracotta">
                                            🏪
                                        </div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">Etalase Digital Cerdas</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            Toko online instan dengan integrasi WhatsApp Cart untuk memudahkan proses pemesanan langsung dari pelanggan.
                                        </p>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 hover:border-terracotta/50 shadow-sm hover:shadow-md rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-terracotta">
                                            📊
                                        </div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">Smart Inventory & ROP</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            Mesin prediksi stok (Reorder Point) yang terintegrasi dengan data historis dan kalender event lokal untuk menghindari kehabisan barang.
                                        </p>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 hover:border-terracotta/50 shadow-sm hover:shadow-md rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-terracotta">
                                            💳
                                        </div>
                                        <h3 className="text-lg font-outfit font-bold text-slate-900">TemanQRIS Generator</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            Buat kode pembayaran QRIS instan untuk setiap transaksi. Terintegrasi langsung dengan pencatatan penjualan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : !profile?.is_seller ? (
                    /* ========================================================
                       KONDISI B: PEMBELI (user && !profile?.is_seller)
                       -> Clean Shopping Experience (Tanpa Metrik Bisnis)
                       ======================================================== */
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
                        {/* Header Sapaan Pembeli */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-2">
                                    🛍️ Mode Pembeli
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-slate-900">
                                    Selamat datang, {profile?.full_name || 'Pembeli'}!
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">
                                    Temukan produk batik khas, kuliner lezat, dan kerajinan unggulan dari UMKM DIY & Jawa Tengah.
                                </p>
                            </div>

                            {/* Bar Pencarian (Search Bar) */}
                            <div className="relative max-w-2xl">
                                <input
                                    type="text"
                                    placeholder="Cari batik keraton, bakpia pathok, kerajinan lurik..."
                                    className="w-full pl-12 pr-24 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                                />
                                <svg
                                    className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                                    Cari
                                </button>
                            </div>
                        </div>

                        {/* Filter Kategori Pilihan */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-outfit font-bold text-slate-900">
                                Jelajahi Kategori Lokal
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <div className="p-4 bg-white border border-slate-200 hover:border-terracotta/50 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧶</span>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta">Batik & Tenun</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">120+ Produk</span>
                                </div>

                                <div className="p-4 bg-white border border-slate-200 hover:border-terracotta/50 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍲</span>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta">Kuliner & Oleh-Oleh</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">85+ Produk</span>
                                </div>

                                <div className="p-4 bg-white border border-slate-200 hover:border-terracotta/50 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏺</span>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta">Kerajinan & Ukiran</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">64+ Produk</span>
                                </div>

                                <div className="p-4 bg-white border border-slate-200 hover:border-terracotta/50 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">☕</span>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta">Kopi & Rempah</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">40+ Produk</span>
                                </div>

                                <div className="p-4 bg-white border border-slate-200 hover:border-terracotta/50 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center col-span-2 sm:col-span-1">
                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎁</span>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta">Gift Box & Hampers</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">30+ Produk</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Produk Rekomendasi */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-outfit font-bold text-slate-900">
                                    Produk Rekomendasi UMKM
                                </h2>
                                <Link href="/toko/batik-keraton" className="text-xs font-semibold text-terracotta hover:underline">
                                    Lihat Semua &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Product Card 1 */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="h-44 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-5xl relative">
                                        🎨
                                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md">
                                            Terlaris
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Batik Keraton • Solo</span>
                                            <span className="text-amber-600 font-bold">⭐ 4.9</span>
                                        </div>
                                        <h3 className="font-outfit font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-terracotta transition-colors">
                                            Batik Tulis Motif Gurdo Premium
                                        </h3>
                                        <div className="flex items-baseline justify-between pt-1">
                                            <span className="text-base font-bold text-terracotta">Rp 450.000</span>
                                            <Link
                                                href="/toko/batik-keraton"
                                                className="px-3 py-1 bg-slate-100 hover:bg-terracotta hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Lihat Toko
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Card 2 */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-5xl relative">
                                        🥮
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Kuliner • Yogyakarta</span>
                                            <span className="text-amber-600 font-bold">⭐ 4.8</span>
                                        </div>
                                        <h3 className="font-outfit font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-terracotta transition-colors">
                                            Bakpia Pathok Premium Assorted 25
                                        </h3>
                                        <div className="flex items-baseline justify-between pt-1">
                                            <span className="text-base font-bold text-terracotta">Rp 45.000</span>
                                            <Link
                                                href="/toko/batik-keraton"
                                                className="px-3 py-1 bg-slate-100 hover:bg-terracotta hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Lihat Toko
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Card 3 */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="h-44 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-5xl relative">
                                        🏺
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Kerajinan • Jepara</span>
                                            <span className="text-amber-600 font-bold">⭐ 5.0</span>
                                        </div>
                                        <h3 className="font-outfit font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-terracotta transition-colors">
                                            Ukiran Kayu Jati Asli Jepara
                                        </h3>
                                        <div className="flex items-baseline justify-between pt-1">
                                            <span className="text-base font-bold text-terracotta">Rp 750.000</span>
                                            <Link
                                                href="/toko/batik-keraton"
                                                className="px-3 py-1 bg-slate-100 hover:bg-terracotta hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Lihat Toko
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Card 4 */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="h-44 bg-gradient-to-br from-stone-100 to-amber-200 flex items-center justify-center text-5xl relative">
                                        ☕
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Kopi • Wonosobo</span>
                                            <span className="text-amber-600 font-bold">⭐ 4.9</span>
                                        </div>
                                        <h3 className="font-outfit font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-terracotta transition-colors">
                                            Kopi Arabika Dieng Plateau 250g
                                        </h3>
                                        <div className="flex items-baseline justify-between pt-1">
                                            <span className="text-base font-bold text-terracotta">Rp 65.000</span>
                                            <Link
                                                href="/toko/batik-keraton"
                                                className="px-3 py-1 bg-slate-100 hover:bg-terracotta hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Lihat Toko
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner Ajak Buka Toko UMKM Baru */}
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <span className="inline-block px-3 py-1 bg-amber-200/60 text-amber-900 rounded-full text-xs font-bold">
                                    💡 Punya Usaha UMKM Sendiri?
                                </span>
                                <h3 className="text-xl font-outfit font-bold text-slate-900">
                                    Buka Toko Digital & Gunakan Asisten AI LORA Gratis!
                                </h3>
                                <p className="text-xs text-slate-600 max-w-2xl">
                                    Dapatkan etalase online cerdas, WhatsApp Cart direct, serta AI Consultant yang membantu analisa stok & omzet tokomu.
                                </p>
                            </div>
                            <Link
                                href="/buka-toko"
                                className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-terracotta/20 transition-all flex-shrink-0"
                            >
                                Buka Toko UMKM Sekarang
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* ========================================================
                       KONDISI C: PENJUAL (user && profile?.is_seller)
                       -> Dasbor Penjual Operasional & Metrik Bisnis Lengkap
                       ======================================================== */
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
                        {/* Welcome Header Penjual */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold mb-2">
                                    🏪 Dasbor Penjual UMKM
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-slate-900">
                                    Selamat datang kembali, {profile?.full_name || 'Pemilik UMKM'}!
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">
                                    Ringkasan analisis bisnis & kesehatan toko Anda hari ini di kawasan DIY & Jawa Tengah.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-terracotta/20 transition-all text-center"
                                >
                                    Kelola Dashboard UMKM
                                </Link>
                            </div>
                        </div>

                        {/* 4 Ringkasan Kartu Metrik (KPI Summary Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Card 1: BHS Score */}
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                    <span>Kesehatan Bisnis (BHS)</span>
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">Bagus</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-outfit font-extrabold text-emerald-600">85</span>
                                    <span className="text-xs text-slate-400">/ 100</span>
                                </div>
                                <p className="text-[11px] text-slate-500">Omzet stabil & ROP persediaan terkendali.</p>
                            </div>

                            {/* Card 2: Proyeksi Omzet */}
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                    <span>Omzet Bulan Ini</span>
                                    <span className="text-emerald-600 text-[11px] font-bold">+38%</span>
                                </div>
                                <div className="text-2xl font-outfit font-extrabold text-slate-900">
                                    Rp 12.500.000
                                </div>
                                <p className="text-[11px] text-slate-500">Total 42 transaksi penjualan.</p>
                            </div>

                            {/* Card 3: ROP Stock Warning */}
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                    <span>Peringatan ROP Stok</span>
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">2 Produk</span>
                                </div>
                                <div className="text-2xl font-outfit font-extrabold text-amber-700">
                                    Perlu Restock
                                </div>
                                <p className="text-[11px] text-slate-500">Batik Solokan (3 sisa), Kain Lurik (1 sisa).</p>
                            </div>

                            {/* Card 4: Event Wisata Terdekat */}
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
                                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                                    <span>Event Daerah Terdekat</span>
                                    <span className="text-terracotta text-[11px] font-bold">H-5</span>
                                </div>
                                <div className="text-lg font-outfit font-bold text-slate-900 truncate">
                                    Sekaten Yogyakarta
                                </div>
                                <p className="text-[11px] text-slate-500">Potensi lonjakan wisatawan +65%.</p>
                            </div>
                        </div>

                        {/* Recommendation AI Consultant Banner */}
                        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 text-2xl flex items-center justify-center flex-shrink-0">
                                    🤖
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-amber-900">Rekomendasi Pintar AI Consultant</h3>
                                    <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                                        Sekaten Yogyakarta tinggal 5 hari lagi! Berdasarkan analisis tren tahunan, permintaan produk souvenir kerajinan dan batik diperkirakan naik pesat. <strong className="text-slate-900">Disarankan restock +50 unit produk terlaris minggu ini.</strong>
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/toko/batik-keraton"
                                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-amber-300 text-xs font-semibold rounded-xl shadow-sm transition-colors flex-shrink-0"
                            >
                                Lihat Katalog Toko
                            </Link>
                        </div>

                        {/* Ringkasan Transaksi & Aktivitas Terbaru */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-outfit font-bold text-slate-900">
                                    Aktivitas Penjualan & Transaksi Terkini
                                </h3>
                                <span className="text-xs text-slate-500 font-medium">Real-time update</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                                            <th className="py-3 px-2">ID Pesanan</th>
                                            <th className="py-3 px-2">Pelanggan</th>
                                            <th className="py-3 px-2">Metode Pembayaran</th>
                                            <th className="py-3 px-2">Total Nominal</th>
                                            <th className="py-3 px-2 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        <tr>
                                            <td className="py-3.5 px-2 font-semibold text-slate-900">#LR-84920</td>
                                            <td className="py-3.5 px-2">Siti Rahmawati (Yogyakarta)</td>
                                            <td className="py-3.5 px-2">TemanQRIS Instant</td>
                                            <td className="py-3.5 px-2 font-bold text-slate-900">Rp 350.000</td>
                                            <td className="py-3.5 px-2 text-right">
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[10px]">
                                                    Lunas
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3.5 px-2 font-semibold text-slate-900">#LR-84919</td>
                                            <td className="py-3.5 px-2">Bambang Tri (Solo)</td>
                                            <td className="py-3.5 px-2">WhatsApp Direct Cart</td>
                                            <td className="py-3.5 px-2 font-bold text-slate-900">Rp 1.200.000</td>
                                            <td className="py-3.5 px-2 text-right">
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[10px]">
                                                    Lunas
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3.5 px-2 font-semibold text-slate-900">#LR-84918</td>
                                            <td className="py-3.5 px-2">Dewi Lestari (Magelang)</td>
                                            <td className="py-3.5 px-2">TemanQRIS Instant</td>
                                            <td className="py-3.5 px-2 font-bold text-slate-900">Rp 180.000</td>
                                            <td className="py-3.5 px-2 text-right">
                                                <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold text-[10px]">
                                                    Menunggu
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Visual Anchor Block: Dark Blue Background for Calendar Event, Final CTA & Footer */}
            <div className="bg-[#0F172A] text-slate-100 border-t border-slate-800">
                {/* Section: Regional Tourist Event Calendar Banner */}
                <section id="event" className="py-16 px-4 sm:px-8 border-b border-slate-800/80">
                    <div className="max-w-5xl mx-auto text-center space-y-6">
                        <div className="inline-flex p-3 bg-terracotta/20 border border-terracotta/30 text-terracotta rounded-2xl text-2xl mx-auto">
                            📅
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-white max-w-2xl mx-auto">
                            Terhubung dengan Kalender Wisata & Event Daerah
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
                            Sekaten, Waisak, hingga Dieng Culture Festival & Festival Kuliner. LORA memprediksi lonjakan pembeli berdasarkan kalender event lokal agar Anda selalu siap menghadapi lonjakan permintaan.
                        </p>
                    </div>
                </section>

                {/* Section: Call-To-Action Box */}
                <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700/80 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-terracotta/20 rounded-full blur-3xl pointer-events-none"></div>

                        <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-white">
                            Siap Memajukan Usaha UMKM Anda Hari Ini?
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                            Bergabunglah dengan ribuan UMKM di DIY dan Jawa Tengah yang telah bertransformasi digital.
                        </p>

                        <div>
                            <Link
                                href={user ? '/toko/batik-keraton' : '/register'}
                                className="inline-block px-8 py-4 bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm sm:text-base rounded-xl shadow-xl shadow-terracotta/30 transition-all hover:-translate-y-0.5"
                            >
                                {user ? 'Jelajahi Katalog UMKM' : 'Mulai Sekarang - Tanpa Kartu Kredit'}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#0B1120] border-t border-slate-800/80 px-4 sm:px-8 py-6 text-xs text-slate-400">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-outfit font-bold text-white">LORA</span>
                            <span>© 2026 LORA Regional Assistant. All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
