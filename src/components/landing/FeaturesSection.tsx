'use client';

import Image from 'next/image';
import {
    Store,
    Bot,
    TrendingUp,
    PackageCheck,
    Calendar,
    ShoppingBag,
    XCircle,
    CheckCircle2,
    Sparkles,
    Layers,
    UtensilsCrossed,
    Shirt,
    Palette,
    Coffee,
    Sprout,
    PackageX,
    MegaphoneOff,
    CalendarX,
    TrendingDown,
    CalendarDays
} from 'lucide-react';
import FadeContent from '@/components/reactbits/FadeContent';
import ShapeDivider from '@/components/ui/ShapeDivider';

export default function FeaturesSection() {
    const problems = [
        {
            icon: PackageX,
            title: 'Pencatatan Stok Manual',
            description: 'Sering lupa atau salah hitung sisa barang dagangan.',
            iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
            icon: MegaphoneOff,
            title: 'Promosi Seadanya',
            description: 'Sulit memiliki etalase toko online resmi tanpa biaya pembuatan web mahal.',
            iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
            icon: CalendarX,
            title: 'Ketinggalan Momen Daerah',
            description: 'Kurang persiapan saat ada agenda liburan atau festival ramai.',
            iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
            icon: TrendingDown,
            title: 'Bingung Evaluasi Usaha',
            description: 'Tidak tahu produk apa yang untung dan apa yang perlu ditingkatkan.',
            iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
        },
    ];

    const solutions = [
        {
            icon: PackageCheck,
            title: 'Notifikasi Stok Otomatis',
            description: 'Sistem memberi tahu sebelum barang habis terjual.',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
            icon: Store,
            title: 'Etalase Toko Siap Pakai',
            description: 'Halaman toko profesional gratis langsung aktif.',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
            icon: CalendarDays,
            title: 'Info Event & Tren Lokal',
            description: 'Tips memanfaatkan keramaian pariwisata DIY & Jateng.',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
            icon: Bot,
            title: 'Asisten AI 24 Jam',
            description: 'Konsultasi praktis untuk ide promo dan pengembangan usaha.',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
    ];

    const features = [
        {
            icon: Store,
            title: 'Etalase Toko Digital',
            description: 'Miliki halaman toko online resmi sendiri dengan link unik yang praktis dibagikan ke WhatsApp dan media sosial.',
            badge: 'Toko Mandiri',
            color: 'from-amber-500/20 to-terracotta/20 text-terracotta'
        },
        {
            icon: Bot,
            title: 'Asisten Bisnis AI',
            description: 'Teman diskusi cerdas berbasis AI yang siap memberikan saran strategi usaha, ide promosi, dan evaluasi penjualan kapan saja.',
            badge: 'Konsultan 24/7',
            color: 'from-indigo-500/20 to-blue-500/20 text-indigo-600'
        },
        {
            icon: TrendingUp,
            title: 'Prediksi Penjualan Pintar',
            description: 'Perkiraan tren penjualan di masa depan sehingga Anda dapat mempersiapkan stok lebih awal tanpa takut rugi.',
            badge: 'Analisis Tren',
            color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600'
        },
        {
            icon: PackageCheck,
            title: 'Pengingat Stok Otomatis',
            description: 'Pemberitahuan otomatis ketika barang dagangan mulai menipis, menjaga toko Anda tidak pernah kehabisan stok favorit.',
            badge: 'Stok Terjaga',
            color: 'from-amber-500/20 to-yellow-500/20 text-amber-600'
        },
        {
            icon: Calendar,
            title: 'Info Event & Keramaian Daerah',
            description: 'Pantau agenda festival, liburan, dan pameran lokal di DIY & Jateng untuk memaksimalkan momen lonjakan pesanan.',
            badge: 'Momen Wisata',
            color: 'from-rose-500/20 to-orange-500/20 text-rose-600'
        },
        {
            icon: ShoppingBag,
            title: 'Pemesanan Mudah & Cepat',
            description: 'Alur belanja yang ramah pengguna, memudahkan pembeli memilih produk ke keranjang dan memesan dalam hitungan detik.',
            badge: 'Belanja Nyaman',
            color: 'from-purple-500/20 to-indigo-500/20 text-purple-600'
        }
    ];

    return (
        <section id="solusi" className="w-full space-y-0">
            {/* BAGIAN 1: SOLUSI & PERMASALAHAN UMKM (LATAR BELAKANG GAMBAR DENGAN OVERLAY GELAP) */}
            <div className="w-full relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
                {/* Background Image: Solusi-Fitur-sectiom.jpg */}
                <Image
                    src="/images/Solusi-Fitur-section.webp"
                    alt="Latar Belakang Solusi dan Fitur UMKM LORA"
                    fill
                    sizes="100vw"
                    className="object-cover object-center pointer-events-none opacity-30 mix-blend-luminosity"
                    priority={false}
                />

                {/* Blackscreen Overlay: Lapisan Gelap Elegan */}
                <div className="absolute inset-0 bg-black/45 pointer-events-none" />

                {/* Konten Utama Solusi & Permasalahan */}
                <div className="relative z-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
                    {/* Header Section with Fade Up */}
                    <FadeContent direction="up" distance={24} duration={600} blur>
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Solusi & Fitur LORA</span>
                            </div>

                            <h2 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-white">
                                Solusi Nyata untuk Kemajuan UMKM Anda
                            </h2>

                            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                                LORA dirancang sederhana dan mudah digunakan, membantu pelaku usaha di segala sektor mengelola toko online, stok barang, dan strategi bisnis dengan bantuan asisten AI.
                            </p>
                        </div>
                    </FadeContent>

                    {/* Inklusivitas Sektor Usaha Banner with Fade Up */}
                    <FadeContent direction="up" distance={20} duration={650} delay={100}>
                        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                            <div className="space-y-2 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <Layers className="w-5 h-5 text-amber-400" />
                                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Inklusif & Fleksibel</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold font-outfit text-white">
                                    Terbuka untuk Berbagai Macam Sektor UMKM
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                                    Mulai dari kuliner lokal, oleh-oleh, batik & fashion, kerajinan kayu, agribisnis, toko sembako, hingga industri kreatif di Daerah Istimewa Yogyakarta, Jawa Tengah, dan sekitarnya.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Kuliner & F&B</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Batik & Busana</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <Palette className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Kerajinan Seni</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Kopi & Olahan</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Agribisnis</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                                    <span>Usaha Kreatif</span>
                                </span>
                            </div>
                        </div>
                    </FadeContent>

                    {/* Problem vs Solution Split Comparison with Staggered Fade (2 Cards, Each having 2x2 Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* KIRI: KENDALA UMUM UMKM TRADISIONAL (GELAP KEBIRUAN & SLATE) */}
                        <FadeContent direction="up" distance={25} duration={600} delay={150}>
                            <div className="bg-[#0B1120]/85 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 h-full shadow-2xl">
                                {/* Header Kendala */}
                                <div className="flex items-center gap-3.5 border-b border-slate-700/70 pb-4">
                                    <div className="p-3 bg-slate-800 text-slate-300 rounded-2xl flex-shrink-0 shadow-xs border border-slate-700">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-100">
                                            Kendala Umum UMKM Tradisional
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium">
                                            Tantangan yang sering menghambat laju bisnis
                                        </p>
                                    </div>
                                </div>

                                {/* 2x2 Grid Item Kendala dengan Ikon */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {problems.map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-xs hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-start"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300 flex-shrink-0 border border-slate-700">
                                                        <ItemIcon className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-xs sm:text-sm font-bold font-outfit text-slate-200 leading-tight">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed pl-0.5">
                                                    {item.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FadeContent>

                        {/* KANAN: SOLUSI CERDAS BERSAMA LORA (GELAP KEBIRUAN & AKSEN KEKUNINGAN AMBER) */}
                        <FadeContent direction="up" distance={25} duration={600} delay={250}>
                            <div className="bg-gradient-to-b from-[#0B1120]/90 to-amber-950/20 backdrop-blur-md border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 h-full shadow-2xl ring-1 ring-amber-500/20">
                                {/* Header Solusi */}
                                <div className="flex items-center gap-3.5 border-b border-amber-500/30 pb-4">
                                    <div className="p-3 bg-gradient-to-tr from-terracotta to-amber-500 text-white rounded-2xl flex-shrink-0 shadow-md shadow-amber-500/20 border border-amber-400/30">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300">
                                            Solusi Cerdas Bersama LORA
                                        </h3>
                                        <p className="text-xs text-amber-200/80 font-medium">
                                            Kemudahan teknologi dalam satu aplikasi
                                        </p>
                                    </div>
                                </div>

                                {/* 2x2 Grid Item Solusi dengan Ikon */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {solutions.map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-2.5 shadow-xs hover:border-amber-400/60 hover:bg-slate-900 transition-all flex flex-col justify-start"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 border border-amber-500/40">
                                                        <ItemIcon className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-xs sm:text-sm font-bold font-outfit text-amber-100 leading-tight">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
                                                    {item.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FadeContent>
                    </div>
                </div>
            </div>

            {/* WAVE SHAPE DIVIDER (Putih Bersih): Mengalir naik dari Section 6 Fitur Utama ke Section Solusi-Fitur */}
            <div className="relative -mt-10 sm:-mt-16 lg:-mt-20 z-20 pointer-events-none">
                <ShapeDivider
                    variant="rising-wave"
                    position="bottom"
                    direction="inward"
                    color="text-white"
                    height="h-10 sm:h-16 md:h-20 lg:h-24"
                />
            </div>

            {/* BAGIAN 2: 6 FITUR UTAMA APLIKASI LORA (Latar Belakang Putih Bersih Menyatu dengan Divider) */}
            <div className="w-full bg-white pt-6 pb-16 sm:pt-10 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-100 shadow-xs relative z-10">
                <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
                    <FadeContent direction="up" distance={20} duration={600}>
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-terracotta rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Kemampuan Unggulan</span>
                            </div>
                            <h3 className="text-xl sm:text-3xl font-outfit font-bold text-slate-900">
                                6 Fitur Utama Aplikasi LORA
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                                Semua fitur dibuat sederhana, praktis, dan dapat langsung digunakan tanpa pelatihan rumit.
                            </p>
                        </div>
                    </FadeContent>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((item, index) => {
                            const ItemIcon = item.icon;
                            return (
                                <FadeContent
                                    key={index}
                                    direction="up"
                                    distance={24}
                                    duration={600}
                                    delay={index * 100}
                                >
                                    <div className="bg-slate-50/80 hover:bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 group h-full flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${item.color} group-hover:scale-105 transition-transform`}>
                                                    <ItemIcon className="w-6 h-6" />
                                                </div>
                                                <span className="text-[11px] font-bold px-3 py-1 bg-white text-slate-700 border border-slate-200 rounded-full">
                                                    {item.badge}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-base sm:text-lg font-outfit font-bold text-slate-900 group-hover:text-terracotta transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeContent>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}