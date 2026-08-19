'use client';

import Link from 'next/link';
import { Sparkles, MapPin, ArrowUp, Store, ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        if (targetId.startsWith('#')) {
            const element = document.getElementById(targetId.substring(1));
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Top Row: Brand Info & Navigation Columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-slate-800/80">
                    {/* Brand Column (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-terracotta via-amber-500 to-amber-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-terracotta/20 group-hover:scale-105 transition-transform">
                                <span className="font-outfit">L</span>
                            </div>
                            <div>
                                <span className="text-xl font-outfit font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">LORA</span>
                                <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none mt-0.5">Regional Assistant</span>
                            </div>
                        </Link>

                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                            Platform digitalisasi terpadu dan Asisten AI untuk membantu memajukan pelaku UMKM lokal di Daerah Istimewa Yogyakarta & Jawa Tengah.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-1">
                            <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                            <span>Daerah Istimewa Yogyakarta & Jawa Tengah</span>
                        </div>
                    </div>

                    {/* Quick Navigation (3 cols) */}
                    <div className="md:col-span-3 space-y-3.5 text-xs sm:text-sm">
                        <p className="font-bold text-white font-outfit uppercase tracking-wider text-xs">
                            Navigasi
                        </p>
                        <ul className="space-y-2.5">
                            <li>
                                <a
                                    href="#solusi"
                                    onClick={(e) => handleSmoothScroll(e, '#solusi')}
                                    className="hover:text-amber-400 transition-colors inline-block"
                                >
                                    Solusi & Fitur LORA
                                </a>
                            </li>
                            <li>
                                <Link href="/katalog" className="hover:text-amber-400 transition-colors inline-block">
                                    Katalog Produk Pilihan
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#sdgs"
                                    onClick={(e) => handleSmoothScroll(e, '#sdgs')}
                                    className="hover:text-amber-400 transition-colors inline-block"
                                >
                                    Dukungan SDGs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    onClick={(e) => handleSmoothScroll(e, '#faq')}
                                    className="hover:text-amber-400 transition-colors inline-block"
                                >
                                    Pertanyaan Umum (FAQ)
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Akun & Pelaku UMKM (4 cols) */}
                    <div className="md:col-span-4 space-y-3.5 text-xs sm:text-sm">
                        <p className="font-bold text-white font-outfit uppercase tracking-wider text-xs">
                            Akses Pengguna
                        </p>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/buka-toko" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                                    <Store className="w-3.5 h-3.5 text-terracotta" />
                                    <span>Buka Toko UMKM Gratis</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-amber-400 transition-colors inline-block">
                                    Masuk ke Akun / Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-amber-400 transition-colors inline-block">
                                    Daftar Akun Baru
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Row: Copyright & Scroll to Top */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p className="text-center sm:text-left">
                        © 2026 LORA. Seluruh Hak Cipta Dilindungi.
                    </p>

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-slate-400">Pemberdayaan Ekonomi Digital & Inovasi Berkelanjutan</span>
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="p-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            title="Kembali ke atas"
                        >
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-[11px] font-bold">Ke Atas</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
