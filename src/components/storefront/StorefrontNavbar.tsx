'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    ShoppingCart,
    Package,
    Store,
    User,
    LogOut,
    Settings,
    ChevronDown,
    MapPin
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

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
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Handler Submit Pencarian
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
            {/* Top Sub-Bar: Informasi Wilayah DIY & Jateng */}
            <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-terracotta" />
                        <span>Katalog Produk UMKM Daerah Istimewa Yogyakarta & Jawa Tengah</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-400">
                        <span>Bantuan LORA</span>
                        <span>|</span>
                        <span>Pemberdayaan UMKM Regional</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                {/* 1. KIRI: Brand Logo LORA */}
                <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-terracotta to-amber-500 flex items-center justify-center shadow-md shadow-terracotta/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-extrabold text-base tracking-wider font-outfit">L</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-outfit font-black tracking-tight text-slate-900 group-hover:text-terracotta transition-colors leading-none">
                            LORA
                        </span>
                        <span className="text-[10px] font-bold text-terracotta tracking-widest uppercase leading-tight mt-0.5">
                            Regional Store
                        </span>
                    </div>
                </Link>

                {/* 2. TENGAH: Kolom Pencarian Dominan (Shopee Style Search Bar) */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 max-w-2xl mx-2 sm:mx-6 relative"
                >
                    <div className="relative flex items-center">
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

                {/* 3. KANAN: Menu Navigasi & Aksi Pengguna */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    {/* A. Ikon Keranjang Belanja */}
                    <Link
                        href={user ? '/cart' : '/login'}
                        className="relative p-2.5 text-slate-600 hover:text-terracotta hover:bg-slate-100 rounded-2xl transition-all group"
                        title="Keranjang Belanja"
                    >
                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            0
                        </span>
                    </Link>

                    {/* B. Ikon / Teks 'Pesanan Saya' */}
                    <Link
                        href={user ? '/orders' : '/login'}
                        className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-terracotta hover:bg-slate-100 rounded-2xl transition-all group"
                        title="Riwayat Pesanan Saya"
                    >
                        <Package className="w-4 h-4 text-slate-500 group-hover:text-terracotta transition-colors" />
                        <span>Pesanan Saya</span>
                    </Link>

                    {/* C. Logika Tombol Toko (Dual-Role Switcher) */}
                    {profile?.is_seller ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-2xl text-xs font-bold transition-all shadow-sm group cursor-pointer"
                        >
                            <Store className="w-4 h-4 text-amber-700 group-hover:scale-105 transition-transform" />
                            <span className="hidden sm:inline">Toko Saya</span>
                        </Link>
                    ) : (
                        <Link
                            href={user ? '/buka-toko' : '/login'}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md group cursor-pointer"
                        >
                            <Store className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
                            <span className="hidden sm:inline">Buka Toko</span>
                        </Link>
                    )}

                    {/* D. Menu Profil / Auth State */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
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
                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-terracotta to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                        {userInitial}
                                    </div>
                                )}
                                <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                                    {userName}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu Melayang */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                                    <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                                        <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>

                                    <Link
                                        href="/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Pengaturan Akun</span>
                                    </Link>

                                    <Link
                                        href="/orders"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors md:hidden"
                                    >
                                        <Package className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Pesanan Saya</span>
                                    </Link>

                                    <form action={logout}>
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
                        <div className="flex items-center gap-2">
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
                </div>
            </div>
        </header>
    );
}
