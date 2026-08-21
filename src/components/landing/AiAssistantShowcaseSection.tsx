'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Bot,
    User,
    Sparkles,
    TrendingUp,
    Calendar,
    PackageCheck,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';
import FadeContent from '@/components/reactbits/FadeContent';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';

export default function AiAssistantShowcaseSection() {
    const question = "Apa yang bisa saya lakukan untuk meningkatkan penjualan toko saya bulan ini?";

    const responsePoints = [
        {
            icon: TrendingUp,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
            title: 'Fokus pada Produk Terlaris',
            text: 'Data penjualan Anda menunjukkan minat tertinggi terjadi di akhir pekan. Pastikan produk unggulan tampil di posisi teratas etalase.'
        },
        {
            icon: Calendar,
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
            title: 'Manfaatkan Event Daerah Terdekat',
            text: 'Ada agenda festival lokal di wilayah Anda minggu depan. Siapkan paket bundling hemat untuk menarik wisatawan & warga sekitar.'
        },
        {
            icon: PackageCheck,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            title: 'Amankan Kesiapan Stok',
            text: 'Dua produk utama Anda mendekati batas minimum stok (ROP). Segera lakukan restock agar tidak kehilangan calon pembeli.'
        },
        {
            icon: Sparkles,
            color: 'text-terracotta bg-terracotta/10 border-terracotta/30',
            title: 'Promosi Langsung ke Pelanggan',
            text: 'Bagikan link etalase toko digital Anda ke WhatsApp & media sosial agar pelanggan dapat langsung memesan dengan cepat.'
        }
    ];

    const [revealedCount, setRevealedCount] = useState<number>(0);
    const [isTyping, setIsTyping] = useState<boolean>(true);
    const [key, setKey] = useState<number>(0);

    // Auto-staggered typing animation for the points
    useEffect(() => {
        setRevealedCount(0);
        setIsTyping(true);

        const timers: NodeJS.Timeout[] = [];

        responsePoints.forEach((_, index) => {
            const timer = setTimeout(() => {
                setRevealedCount(index + 1);
                if (index === responsePoints.length - 1) {
                    setIsTyping(false);
                }
            }, (index + 1) * 1250);
            timers.push(timer);
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [key]);

    const handleReplay = () => {
        setKey(prev => prev + 1);
    };

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pt-6">
            {/* 1. Header Area: Subheadline & Penjelasan Ringkas Fitur AI */}
            <FadeContent direction="up" distance={24} duration={1000} blur>
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                        <span>Didukung Kecerdasan Buatan LORA AI</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-slate-900">
                        Asisten Bisnis Cerdas untuk
                        <br />Kemajuan Usaha Anda
                    </h2>

                    <p className="text-slate-600 text-xs sm:text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                        Dapatkan saran strategi penjualan, rekomendasi produk terlaris, pengingat stok, dan analisis momen event daerah secara otomatis layaknya memiliki konsultan bisnis pribadi 24/7.
                    </p>
                </div>
            </FadeContent>

            {/* 2. Main Showcase: Layout 2 Kolom (Kiri: Maskot Tanpa Background Card, Kanan: Spotlight Card AI Demo) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Kolom Kiri: Maskot Karakter LORA (Tanpa Background Card / Transparan) */}
                <FadeContent direction="right" distance={28} duration={1100} delay={200} className="lg:col-span-5 flex flex-col items-center justify-center relative">
                    {/* Ambient Subtle Glow Behind Mascot */}
                    <div className="absolute w-72 h-72 bg-gradient-to-tr from-amber-400/25 to-terracotta/20 rounded-full blur-3xl -z-10 pointer-events-none" />

                    <div className="relative w-52 h-64 sm:w-80 sm:h-96 lg:w-full lg:h-[420px] transition-transform duration-700 hover:scale-105">
                        <Image
                            src="/images/icon-lora.png"
                            alt="Maskot Karakter LORA AI"
                            fill
                            sizes="(max-width: 640px) 208px, (max-width: 1024px) 320px, 420px"
                            className="object-contain drop-shadow-[0_20px_35px_rgba(217,119,6,0.3)] animate-pulse"
                            style={{ animationDuration: '6s' }}
                            priority
                        />
                    </div>
                </FadeContent>

                {/* Kolom Kanan: SpotlightCard Asisten AI (React Bits Spotlight Component) */}
                <FadeContent direction="left" distance={28} duration={1100} delay={250} className="lg:col-span-7">
                    <SpotlightCard spotlightColor="rgba(217, 119, 6, 0.22)" className="p-4 sm:p-6 sm:p-8 space-y-5 sm:space-y-6">
                        {/* Background Decorative Glow in Card */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header Inside Card: Status & Replay Button */}
                        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/90 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta via-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-terracotta/30 flex-shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm sm:text-base font-bold font-outfit text-white">
                                            Konsultasi LORA AI
                                        </h3>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <ShinyText text="Online 24 Jam" speed={3} className="text-emerald-300 font-bold" />
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">Siap mendampingi pengambilan keputusan bisnis</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleReplay}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Putar Ulang Simulasi"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden sm:inline">Ulangi</span>
                            </button>
                        </div>

                        {/* Chat Messages Flow */}
                        <div className="relative z-10 space-y-4">
                            {/* User Question Bubble */}
                            <div className="flex items-start justify-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="max-w-lg bg-gradient-to-r from-terracotta to-amber-600 text-white rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-md shadow-terracotta/20 text-xs sm:text-sm font-medium leading-relaxed">
                                    <p>{question}</p>
                                    <span className="text-[9px] text-amber-200/80 mt-1 block text-right">Pemilik UMKM • Simulasi Tanya</span>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* AI Response Box */}
                            <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-500">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-terracotta to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                    <Bot className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xl space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <span className="text-xs font-bold text-slate-200">Rekomendasi Strategis LORA AI</span>
                                        </div>
                                        {isTyping ? (
                                            <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                                                Mengetik...
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Siap Diterapkan
                                            </span>
                                        )}
                                    </div>

                                    {/* 4 Points Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {responsePoints.map((item, idx) => {
                                            const isRevealed = idx < revealedCount;
                                            const ItemIcon = item.icon;

                                            if (!isRevealed) return null;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1 animate-in fade-in slide-in-from-left-2 duration-300"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`p-1 rounded-md border ${item.color}`}>
                                                            <ItemIcon className="w-3 h-3" />
                                                        </div>
                                                        <h4 className="text-[11px] sm:text-xs font-bold text-white leading-tight">{item.title}</h4>
                                                    </div>
                                                    <p className="text-[10px] sm:text-[11px] text-slate-300 leading-relaxed pl-0.5">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Typing indicator */}
                                    {isTyping && revealedCount < responsePoints.length && (
                                        <div className="flex items-center gap-1 pt-1 text-slate-400 text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </FadeContent>
            </div>
        </section>
    );
}
