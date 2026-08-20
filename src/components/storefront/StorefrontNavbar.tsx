'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Search,
    ShoppingCart,
    Package,
    Store,
    LogOut,
    Settings,
    ChevronDown,
    MapPin,
    Menu,
    X,
    User
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import { useCart } from '@/components/storefront/CartContext';
import toast from 'react-hot-toast';

export interface StorefrontNavbarProps {
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

export default function StorefrontNavbar({ user, profile }: StorefrontNavbarProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Global Cart State
    const { totalItemsCount, currentStoreSlug, clearCart } = useCart();

    // Prevent hydration mismatch by waiting for client mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter nama & inisial
    const userName = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna';
    const userInitial = userName.charAt(0).toUpperCase();

    // Close profile dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handler Submit Pencarian Global Header
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    const displayCartCount = isMounted ? totalItemsCount : 0;
    const activeStoreSlug = isMounted ? currentStoreSlug : null;

    // Dynamic cart link destination
    const cartHref = activeStoreSlug && displayCartCount > 0
        ? `/toko/${activeStoreSlug}/checkout`
        : '#';

    const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!activeStoreSlug || displayCartCount === 0) {
            e.preventDefault();
            toast.error('Keranjang Anda masih kosong. Silakan pilih produk dari toko terlebih dahulu.');
        }
    };

    return (
        <header suppressHydrationWarning className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
            {/* Top Sub-Bar: Informasi Wilayah DIY & Jateng */}
            <div suppressHydrationWarning className="bg-slate-900 text-slate-300 text-[10px] sm:text-[11px] py-1.5 px-4 sm:px-8">
                <div suppressHydrationWarning className="max-w-7xl mx-auto flex items-center justify-between">
                    <div suppressHydrationWarning className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                        <span className="truncate">Katalog UMKM DIY & Jawa Tengah</span>
                    </div>
                    <div suppressHydrationWarning className="hidden sm:flex items-center gap-4 text-slate-400">
                        <span>Bantuan LORA</span>
                        <span>|</span>
                        <span>Pemberdayaan UMKM Regional</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
                {/* 1. KIRI: Brand Logo LORA (Mengarah SELALU ke /katalog) */}
                <Link href="/katalog" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shadow-terracotta/25 border border-slate-100/80 overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
                        <Image
                            src="/images/loralogo.jpeg"
                            alt="Logo LORA"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover rounded-full"
                            priority
                        />
                    </div>
                    <div suppressHydrationWarning className="flex flex-col">
                        <span className="text-lg sm:text-xl font-outfit font-black tracking-tight text-slate-900 group-hover:text-terracotta transition-colors leading-none">
                            LORA
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-terracotta tracking-widest uppercase leading-tight mt-0.5">
                            Regional Store
                        </span>
                    </div>
                </Link>

                {/* 2. TENGAH: Search Bar Desktop */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="hidden md:flex flex-1 max-w-2xl mx-4 relative"
                >
                    <div suppressHydrationWarning className="relative flex items-center w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari batik Solo, bakpia Jogja, ukiran Jepara, atau produk UMKM..."
                            className="w-full pl-4 pr-12 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-300/80 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 p-2 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl transition-all shadow-md shadow-terracotta/20 flex items-center justify-center cursor-pointer"
                            aria-label="Cari Produk"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {/* 3. KANAN: Navigasi Desktop & Aksi Mobile */}
                <div suppressHydrationWarning className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {/* Toggle Search Button di Mobile (< md) */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMobileSearchOpen(!isMobileSearchOpen);
                            setIsMobileMenuOpen(false);
                        }}
                        className="p-2 text-slate-600 hover:text-terracotta hover:bg-slate-100 rounded-xl md:hidden transition-colors"
                        aria-label="Toggle Pencarian Mobile"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Ikon Keranjang Belanja dengan Badge Real-Time */}
                    <Link
                        href={cartHref}
                        onClick={handleCartClick}
                        className="relative p-2 sm:p-2.5 text-slate-600 hover:text-terracotta hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all group"
                        title="Keranjang Belanja"
                    >
                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span suppressHydrationWarning className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {displayCartCount}
                        </span>
                    </Link>

                    {/* Desktop Menu: Pesanan Saya */}
                    <Link
                        href={user ? '/user/pesanan' : '/login'}
                        className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-terracotta hover:bg-slate-100 rounded-2xl transition-all group"
                        title="Riwayat Pesanan Saya"
                    >
                        <Package className="w-4 h-4 text-slate-500 group-hover:text-terracotta transition-colors" />
                        <span>Pesanan Saya</span>
                    </Link>

                    {/* Desktop Menu: Logika Tombol Toko (SELALU Mengarah ke /toko/dashboard) */}
                    {profile?.is_seller ? (
                        <Link
                            href="/dashboard"
                            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-2xl text-xs font-bold transition-all shadow-sm group cursor-pointer"
                        >
                            <Store className="w-4 h-4 text-amber-700 group-hover:scale-105 transition-transform" />
                            <span>Toko Saya</span>
                        </Link>
                    ) : (
                        <Link
                            href={user ? '/buka-toko' : '/login'}
                            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md group cursor-pointer"
                        >
                            <Store className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
                            <span>Buka Toko</span>
                        </Link>
                    )}

                    {/* Desktop Menu Profil */}
                    {user ? (
                        <div suppressHydrationWarning className="relative hidden md:block" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-terracotta/40 cursor-pointer"
                            >
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={userName}
                                        className="w-7 h-7 rounded-xl object-cover border border-slate-300"
                                    />
                                ) : (
                                    <div suppressHydrationWarning className="w-7 h-7 rounded-xl bg-gradient-to-tr from-terracotta to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                        {isMounted ? userInitial : 'P'}
                                    </div>
                                )}
                                <span suppressHydrationWarning className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                                    {isMounted ? userName : 'Pengguna'}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu Desktop */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                                    <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                                        <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>

                                    <Link
                                        href="/akun"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Pengaturan Akun</span>
                                    </Link>

                                    <form action={logout} onSubmit={() => clearCart()}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                        >
                                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Keluar (Logout)</span>
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="px-3.5 py-2 text-xs font-bold text-white bg-terracotta hover:bg-terracotta-hover rounded-xl shadow-md shadow-terracotta/20 transition-all hover:-translate-y-0.5"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    {/* Tombol Hamburger Menu Mobile (< md) */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                            setIsMobileSearchOpen(false);
                        }}
                        className="p-2 text-slate-700 hover:text-terracotta hover:bg-slate-100 rounded-xl md:hidden transition-colors"
                        aria-label="Toggle Mobile Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Collapsible Mobile Search Bar */}
            {isMobileSearchOpen && (
                <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-150">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk UMKM..."
                            className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-terracotta text-white rounded-lg"
                        >
                            <Search className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Hamburger Drawer Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    {/* Search Field inside Mobile Menu */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari batik, bakpia, kerajinan..."
                            className="w-full pl-3.5 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-terracotta text-white rounded-lg"
                        >
                            <Search className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    {/* Nav Links */}
                    <div className="space-y-1 pt-1">
                        <Link
                            href={cartHref}
                            onClick={(e) => {
                                handleCartClick(e);
                                if (activeStoreSlug && displayCartCount > 0) setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                            <div className="flex items-center gap-2.5">
                                <ShoppingCart className="w-4 h-4 text-terracotta" />
                                <span>Keranjang Belanja</span>
                            </div>
                            <span suppressHydrationWarning className="px-2 py-0.5 bg-terracotta text-white rounded-full text-[10px] font-bold">
                                {displayCartCount}
                            </span>
                        </Link>

                        <Link
                            href={user ? '/user/pesanan' : '/login'}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                            <Package className="w-4 h-4 text-terracotta" />
                            <span>Pesanan Saya</span>
                        </Link>

                        {profile?.is_seller ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 rounded-xl border border-amber-200"
                            >
                                <Store className="w-4 h-4 text-amber-700" />
                                <span>Dashboard Toko Saya</span>
                            </Link>
                        ) : (
                            <Link
                                href={user ? '/buka-toko' : '/login'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl"
                            >
                                <Store className="w-4 h-4 text-amber-400" />
                                <span>Buka Toko UMKM Baru</span>
                            </Link>
                        )}
                    </div>

                    {/* User Auth Section in Mobile Menu */}
                    <div className="pt-2 border-t border-slate-100">
                        {user ? (
                            <div className="space-y-2">
                                <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center gap-2.5">
                                    <div suppressHydrationWarning className="w-7 h-7 rounded-xl bg-terracotta text-white font-bold text-xs flex items-center justify-center">
                                        {isMounted ? userInitial : 'P'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">{isMounted ? userName : 'Pengguna'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/akun"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                                >
                                    <Settings className="w-4 h-4 text-slate-500" />
                                    <span>Pengaturan Akun</span>
                                </Link>

                                <form action={logout} onSubmit={() => clearCart()}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl text-left"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span>Keluar (Logout)</span>
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-2.5 text-center text-xs font-bold text-white bg-terracotta rounded-xl shadow-md shadow-terracotta/20"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
