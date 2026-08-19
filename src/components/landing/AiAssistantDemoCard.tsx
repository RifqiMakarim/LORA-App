'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Bot,
    User,
    Sparkles,
    TrendingUp,
    Calendar,
    PackageCheck,
    ArrowRight,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

interface AiAssistantDemoCardProps {
    isSeller?: boolean;
    isLoggedIn?: boolean;
}

export default function AiAssistantDemoCard({ isSeller = false, isLoggedIn = false }: AiAssistantDemoCardProps) {
    const question = "Bagaimana saran strategi untuk meningkatkan omzet toko saya menjelang event liburan ini?";

    const responsePoints = [
        {
            icon: TrendingUp,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 group-hover:border-amber-400',
            title: 'Fokus pada Produk Terlaris',
            text: 'Data riwayat menunjukkan lonjakan pesanan produk unggulan di akhir pekan. Pastikan visibilitas etalase digital tetap prima.'
        },
        {
            icon: Calendar,
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 group-hover:border-blue-400',
            title: 'Manfaatkan Event Daerah DIY-Jateng',
            text: 'Ada agenda festival daerah minggu depan. Siapkan paket bundling oleh-oleh hemat untuk menarik wisatawan lokal.'
        },
        {
            icon: PackageCheck,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 group-hover:border-emerald-400',
            title: 'Amankan Kesiapan Stok (ROP)',
            text: 'Dua produk utama Anda mendekati batas stok minimum. Segera lakukan restock agar potensi pesanan tidak terlewat.'
        },
        {
            icon: Sparkles,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 group-hover:border-rose-400',
            title: 'Promosi Langsung via WhatsApp',
            text: 'Bagikan tautan katalog toko mandiri Anda ke WhatsApp pelanggan setia untuk memicu transaksi ulang dengan cepat.'
        }
    ];

    // Determine target link for the AI consultant CTA
    const consultantHref = isSeller
        ? '/dashboard/ai-consultant'
        : (isLoggedIn ? '/buka-toko' : '/register');

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 lg:p-12">
            {/* Background Decorative Glow Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto space-y-8 lg:space-y-10">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Simulasi Interaktif Kecerdasan Buatan</span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-outfit font-black text-white">
                            Asisten Bisnis AI Khusus UMKM Daerah
                        </h2>
                    </div>

                    <Link
                        href={consultantHref}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-terracotta to-amber-600 hover:from-terracotta-hover hover:to-amber-700 text-white rounded-xl text-xs font-bold font-outfit shadow-md shadow-terracotta/20 transition-all hover:scale-102 self-start sm:self-auto cursor-pointer"
                    >
                        <span>{isSeller ? "Buka AI Consultant" : "Mulai Coba Asisten AI"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* 2-Column Split: KIRI = Karakter LORA, KANAN = Simulasi Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    {/* 1. KOLOM KIRI (5 COLS): KARAKTER LORA ICON & PROFIL */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-5 backdrop-blur-md group hover:border-amber-500/50 transition-all duration-300">
                            {/* Glow aura behind character */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-terracotta/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Status Online Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>LORA AI Siap Mendampingi 24/7</span>
                            </div>

                            {/* Gambar Karakter LORA */}
                            <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 group-hover:scale-105 transition-transform duration-500">
                                <Image
                                    src="/images/icon-lora.png"
                                    alt="Karakter Asisten LORA"
                                    fill
                                    sizes="(max-width: 640px) 176px, 208px"
                                    className="object-contain drop-shadow-[0_15px_30px_rgba(217,119,6,0.35)]"
                                    priority
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg sm:text-xl font-outfit font-extrabold text-white">
                                    LORA Virtual Assistant
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Konsultan Cerdas UMKM DIY & Jawa Tengah
                                </p>
                            </div>

                            {/* Micro Badges */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-left">
                                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                                    <p className="text-[10px] text-slate-400">Kemampuan AI</p>
                                    <p className="text-xs font-bold text-amber-400">Analisis Penjualan</p>
                                </div>
                                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                                    <p className="text-[10px] text-slate-400">Konteks Daerah</p>
                                    <p className="text-xs font-bold text-emerald-400">Kalender Event Lokal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. KOLOM KANAN (7 COLS): KARTU SIMULASI PERCAKAPAN */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Bubble Tanya dari Pelaku UMKM */}
                        <div className="flex items-start justify-end gap-3">
                            <div className="max-w-lg bg-gradient-to-r from-terracotta to-amber-600 text-white rounded-2xl rounded-tr-xs p-4 sm:p-5 shadow-lg shadow-terracotta/20 text-xs sm:text-sm font-medium leading-relaxed">
                                <p>{question}</p>
                                <span className="text-[10px] text-amber-200/80 mt-1 block text-right">Pemilik Toko UMKM • Contoh Pertanyaan</span>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                                <User className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Box Jawaban AI dengan 4 Kartu Rekomendasi Statis + Efek Hover */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-terracotta to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                                <Bot className="w-4 h-4" />
                            </div>

                            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-3xl rounded-tl-xs p-5 sm:p-6 shadow-xl space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold text-slate-200">Rekomendasi Strategis Asisten LORA</span>
                                    </div>
                                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Siap Diterapkan
                                    </span>
                                </div>

                                {/* 4 Kotak Rekomendasi Statis dengan Animasi Hover Interaktif */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {responsePoints.map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="p-4 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl space-y-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group cursor-default"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`p-2 rounded-xl border transition-transform group-hover:scale-110 ${item.color}`}>
                                                        <ItemIcon className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                    {item.text}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer Box Tips */}
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90">
                                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                                        <span>Analisis disesuaikan dengan data real-time toko Anda</span>
                                    </div>

                                    <Link
                                        href={consultantHref}
                                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                                    >
                                        <span>Coba Tanya Pertanyaan Lain</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
