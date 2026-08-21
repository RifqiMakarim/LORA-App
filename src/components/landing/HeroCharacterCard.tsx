'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bot, Sparkles, TrendingUp, PackageCheck, ShieldCheck } from 'lucide-react';

interface HeroCharacterCardProps {
    characterSrc?: string;
}

export default function HeroCharacterCard({ characterSrc = '/images/icon-lora.png' }: HeroCharacterCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative mx-auto w-full max-w-md lg:max-w-none flex items-center justify-center">
            {/* Ambient Background Glow Aura */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/25 via-terracotta/20 to-indigo-500/20 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
            <div className="absolute w-72 h-72 bg-amber-400/15 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Main Character Display Card */}
            <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/95 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                {/* Header Card: Status LORA AI */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta via-amber-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-terracotta/30">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white font-outfit">LORA AI Assistant</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                                    Online
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">Siap Mendampingi UMKM 24/7</p>
                        </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                </div>

                {/* Center Graphic: Character Image / Illustrated Mascot */}
                <div className="relative py-4 flex flex-col items-center justify-center">
                    <div className="relative group">
                        {!imageError ? (
                            <div className="relative w-48 h-48 sm:w-56 sm:h-56 transition-transform duration-500 group-hover:scale-105">
                                <Image
                                    src={characterSrc}
                                    alt="Karakter Asisten LORA"
                                    fill
                                    sizes="(max-width: 640px) 192px, 224px"
                                    className="object-contain drop-shadow-[0_15px_25px_rgba(217,119,6,0.35)]"
                                    onError={() => setImageError(true)}
                                    priority
                                />
                            </div>
                        ) : (
                            /* Fallback Ilustrasi Maskot LORA yang Estetik */
                            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-slate-800 via-slate-800/90 to-amber-950/40 border border-slate-700 p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-terracotta to-amber-500 flex items-center justify-center text-white shadow-xl shadow-terracotta/40">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Sahabat Cerdas UMKM</p>
                                    <p className="text-[10px] text-amber-300 font-medium">Asisten Digital Omni-channel</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Micro-Badges Row */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center gap-2.5 transition-all">
                        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-slate-400">Prediksi Penjualan</p>
                            <p className="text-xs font-bold text-white truncate">Tren Positif 📈</p>
                        </div>
                    </div>

                    <div className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center gap-2.5 transition-all">
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <PackageCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-slate-400">Pengingat Stok</p>
                            <p className="text-xs font-bold text-white truncate">Aman & Terpantau</p>
                        </div>
                    </div>
                </div>

                {/* Subtitle Footer on Card */}
                <div className="text-center pt-1">
                    <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dirancang Khusus Mendukung Segala Sektor UMKM</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
