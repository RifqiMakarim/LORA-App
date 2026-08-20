'use client';

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

export default function FeaturesSection() {
    const problems = [
        {
            icon: PackageX,
            title: 'Pencatatan Stok Manual',
            description: 'Sering lupa atau salah hitung sisa barang dagangan.',
            iconBg: 'bg-rose-100 text-rose-600',
        },
        {
            icon: MegaphoneOff,
            title: 'Promosi Seadanya',
            description: 'Sulit memiliki etalase toko online resmi tanpa biaya pembuatan web mahal.',
            iconBg: 'bg-rose-100 text-rose-600',
        },
        {
            icon: CalendarX,
            title: 'Ketinggalan Momen Daerah',
            description: 'Kurang persiapan saat ada agenda liburan atau festival ramai.',
            iconBg: 'bg-rose-100 text-rose-600',
        },
        {
            icon: TrendingDown,
            title: 'Bingung Evaluasi Usaha',
            description: 'Tidak tahu produk apa yang untung dan apa yang perlu ditingkatkan.',
            iconBg: 'bg-rose-100 text-rose-600',
        },
    ];

    const solutions = [
        {
            icon: PackageCheck,
            title: 'Notifikasi Stok Otomatis',
            description: 'Sistem memberi tahu sebelum barang habis terjual.',
            iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
            icon: Store,
            title: 'Etalase Toko Siap Pakai',
            description: 'Halaman toko profesional gratis langsung aktif.',
            iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
            icon: CalendarDays,
            title: 'Info Event & Tren Lokal',
            description: 'Tips memanfaatkan keramaian pariwisata DIY & Jateng.',
            iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
            icon: Bot,
            title: 'Asisten AI 24 Jam',
            description: 'Konsultasi praktis untuk ide promo dan pengembangan usaha.',
            iconBg: 'bg-emerald-100 text-emerald-600',
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
        <section id="solusi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pt-8">
            {/* Header Section with Fade Up */}
            <FadeContent direction="up" distance={24} duration={600} blur>
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                        <span>Solusi & Fitur LORA</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-slate-900">
                        Solusi Nyata untuk Kemajuan UMKM Anda
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        LORA dirancang sederhana dan mudah digunakan, membantu pelaku usaha di segala sektor mengelola toko online, stok barang, dan strategi bisnis dengan bantuan asisten AI.
                    </p>
                </div>
            </FadeContent>

            {/* Inklusivitas Sektor Usaha Banner with Fade Up */}
            <FadeContent direction="up" distance={20} duration={650} delay={100}>
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-terracotta/10 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Layers className="w-5 h-5 text-terracotta" />
                            <span className="text-xs font-bold text-terracotta uppercase tracking-wider">Inklusif & Fleksibel</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-outfit text-slate-900">
                            Terbuka untuk Berbagai Macam Sektor UMKM
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                            Mulai dari kuliner lokal, oleh-oleh, batik & fashion, kerajinan kayu, agribisnis, toko sembako, hingga industri kreatif di Daerah Istimewa Yogyakarta, Jawa Tengah, dan sekitarnya.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                            <span>Kuliner & F&B</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Batik & Busana</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <Palette className="w-3.5 h-3.5 text-rose-600" />
                            <span>Kerajinan Seni</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <Coffee className="w-3.5 h-3.5 text-amber-700" />
                            <span>Kopi & Olahan</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Agribisnis</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                            <span>Usaha Kreatif</span>
                        </span>
                    </div>
                </div>
            </FadeContent>

            {/* Problem vs Solution Split Comparison with Staggered Fade (2 Cards, Each having 2x2 Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* KIRI: KENDALA UMUM UMKM TRADISIONAL (2x2 GRID) */}
                <FadeContent direction="up" distance={25} duration={600} delay={150}>
                    <div className="bg-rose-50/70 border border-rose-200/90 rounded-3xl p-6 sm:p-8 space-y-6 h-full shadow-xs">
                        {/* Header Kendala */}
                        <div className="flex items-center gap-3.5 border-b border-rose-200/70 pb-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl flex-shrink-0 shadow-xs">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-outfit font-black text-rose-950">
                                    Kendala Umum UMKM Tradisional
                                </h3>
                                <p className="text-xs text-rose-700 font-medium">
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
                                        className="bg-white/80 border border-rose-200/70 rounded-2xl p-4 space-y-2.5 shadow-xs hover:bg-white transition-all flex flex-col justify-start"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                                                <ItemIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold font-outfit text-slate-900 leading-tight">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </FadeContent>

                {/* KANAN: SOLUSI CERDAS BERSAMA LORA (2x2 GRID) */}
                <FadeContent direction="up" distance={25} duration={600} delay={250}>
                    <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 space-y-6 h-full shadow-xs">
                        {/* Header Solusi */}
                        <div className="flex items-center gap-3.5 border-b border-emerald-200/70 pb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl flex-shrink-0 shadow-xs">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-outfit font-black text-emerald-950">
                                    Solusi Cerdas Bersama LORA
                                </h3>
                                <p className="text-xs text-emerald-700 font-medium">
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
                                        className="bg-white/80 border border-emerald-200/70 rounded-2xl p-4 space-y-2.5 shadow-xs hover:bg-white transition-all flex flex-col justify-start"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                                                <ItemIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold font-outfit text-slate-900 leading-tight">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </FadeContent>
            </div>

            {/* 6 Fitur Utama Grid Cards with Staggered Fade Up */}
            <div className="space-y-8">
                <FadeContent direction="up" distance={20} duration={600}>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl sm:text-3xl font-outfit font-bold text-slate-900">
                            6 Fitur Utama Aplikasi LORA
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
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
                                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 group h-full flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${item.color} group-hover:scale-105 transition-transform`}>
                                                <ItemIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-[11px] font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
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
        </section>
    );
}