'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Store,
    LogOut,
    Settings,
    ChevronDown,
    MapPin,
    Menu,
    X,
    ShoppingBag,
    Sparkles,
    User,
    Package
} from 'lucide-react';
import Image from 'next/image';
import { logout } from '@/app/(auth)/actions';
import { useCart } from '@/components/storefront/CartContext';

export interface LandingNavbarProps {
    user?: {
        id: string;
        email?: string;
    } | null;
    profile?: {
        full_name?: string | null;
        avatar_url?: string | null;
        is_seller?: boolean | null;
        is_buyer?: boolean | null;
    } | null;
}

export default function LandingNavbar({ user, profile }: LandingNavbarProps) {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Global Cart State
    const { totalItemsCount, currentStoreSlug } = useCart();

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Observer to highlight active navigation link based on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['solusi', 'sdgs', 'faq'];
            const scrollPosition = window.scrollY + 120;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(sectionId);
                        return;
                    }
                }
            }
            if (window.scrollY < 200) {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna';
    const userInitial = userName.charAt(0).toUpperCase();

    // Handler Logout yang aman
    const handleLogout = async () => {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('lora_global_cart');
        }
        try {
            await logout();
        } catch {
            window.location.href = '/login';
        }
    };

    const displayCartCount = isMounted ? totalItemsCount : 0;
    const activeStoreSlug = isMounted ? currentStoreSlug : null;

    const cartHref = activeStoreSlug && displayCartCount > 0
        ? `/toko/${activeStoreSlug}/checkout`
        : '/katalog';

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        if (targetId.startsWith('#')) {
            const element = document.getElementById(targetId.substring(1));
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setIsMobileMenuOpen(false);
            }
        }
    };

    return (
        <header suppressHydrationWarning className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 shadow-xs transition-all">
            {/* Main Navbar */}
            <div suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                {/* 1. KIRI: LOGO LORA */}
                <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shadow-terracotta/25 border border-slate-100/80 overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
                        <Image
                            src="/images/loralogo.jpeg"
                            alt="Logo LORA"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full"
                            priority
                        />
                    </div>
                    <div suppressHydrationWarning className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-outfit font-black tracking-tight text-slate-900 group-hover:text-terracotta transition-colors leading-none">
                            LORA
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-terracotta tracking-widest uppercase leading-tight mt-0.5">
                            Regional Assistant
                        </span>
                    </div>
                </Link>

                {/* 2. TENGAH: MENU LINK UTAMA (Solusi, Katalog, SDGs, FAQ) */}
                <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
                    <a
                        href="#solusi"
                        onClick={(e) => handleSmoothScroll(e, '#solusi')}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            activeSection === 'solusi'
                                ? 'bg-amber-50 text-terracotta font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        Solusi & Fitur
                    </a>

                    <Link
                        href="/katalog"
                        className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                    >
                        <span>Katalog Produk</span>
                    </Link>

                    <a
                        href="#faq"
                        onClick={(e) => handleSmoothScroll(e, '#faq')}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                            activeSection === 'faq'
                                ? 'bg-amber-50 text-terracotta font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        FAQ
                    </a>
                </nav>

                {/* 3. KANAN: AUTH ACTIONS (GUEST vs LOGGED IN) */}
                <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* JIKA USER BELUM LOGIN (GUEST MODE) */}
                    {!user ? (
                        <div className="hidden md:flex items-center gap-2.5">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-terracotta to-amber-600 hover:from-terracotta-hover hover:to-amber-700 rounded-xl shadow-md shadow-terracotta/20 transition-all hover:scale-102"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    ) : (
                        /* JIKA USER SUDAH LOGIN (LOGGED IN MODE) */
                        <div suppressHydrationWarning className="hidden md:flex items-center gap-3">
                            {/* Keranjang Belanja */}
                            <Link
                                href={cartHref}
                                className="relative p-2 text-slate-600 hover:text-terracotta hover:bg-slate-100 rounded-xl transition-all group"
                                title="Keranjang Belanja"
                            >
                                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {displayCartCount > 0 && (
                                    <span suppressHydrationWarning className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                                        {displayCartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Tombol Buka Toko / Toko Saya */}
                            {profile?.is_seller ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                                >
                                    <Store className="w-4 h-4 text-amber-700" />
                                    <span>Dashboard Toko</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/buka-toko"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                    <Store className="w-4 h-4 text-amber-400" />
                                    <span>Buka Toko UMKM</span>
                                </Link>
                            )}

                            {/* Dropdown Profil Pengguna */}
                            <div suppressHydrationWarning className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
                                >
                                    <div suppressHydrationWarning className="w-7 h-7 rounded-lg bg-gradient-to-tr from-terracotta to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                        {isMounted ? userInitial : 'U'}
                                    </div>
                                    <span suppressHydrationWarning className="text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                                        {isMounted ? userName : 'Pengguna'}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                                        <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                                            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/user/pesanan"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <Package className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Pesanan Saya</span>
                                        </Link>

                                        <Link
                                            href="/akun"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Pengaturan Akun</span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                        >
                                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Keluar (Logout)</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tombol Hamburger Menu Mobile (< md) */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-700 hover:text-terracotta hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu Dropdown (< md) */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                        <a
                            href="#solusi"
                            onClick={(e) => handleSmoothScroll(e, '#solusi')}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <span>Solusi & Fitur LORA</span>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </a>

                        <Link
                            href="/katalog"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <span>Katalog Produk UMKM</span>
                            <ShoppingBag className="w-4 h-4 text-terracotta" />
                        </Link>

                        <a
                            href="#sdgs"
                            onClick={(e) => handleSmoothScroll(e, '#sdgs')}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <span>Dukungan SDGs</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">8,9,10,12</span>
                        </a>

                        <a
                            href="#faq"
                            onClick={(e) => handleSmoothScroll(e, '#faq')}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <span>FAQ (Tanya Jawab)</span>
                        </a>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                        {!user ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-2.5 text-center text-xs font-bold text-white bg-terracotta hover:bg-terracotta-hover rounded-xl shadow-md shadow-terracotta/20"
                                >
                                    Daftar
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center gap-2.5">
                                    <div suppressHydrationWarning className="w-8 h-8 rounded-xl bg-terracotta text-white font-bold text-xs flex items-center justify-center">
                                        {isMounted ? userInitial : 'U'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">{isMounted ? userName : 'Pengguna'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {profile?.is_seller ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 rounded-xl border border-amber-200"
                                    >
                                        <Store className="w-4 h-4 text-amber-700" />
                                        <span>Dashboard Toko Saya</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/buka-toko"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
                                    >
                                        <Store className="w-4 h-4 text-amber-400" />
                                        <span>Buka Toko UMKM Baru</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500" />
                                    <span>Keluar (Logout)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
