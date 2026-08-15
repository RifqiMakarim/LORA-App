'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    TrendingUp,
    Sparkles,
    Calendar,
    Settings,
    ArrowLeft,
    Store,
    Menu,
    X,
    LogOut,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

interface DashboardShellProps {
    children: React.ReactNode;
    user?: {
        id: string;
        email?: string;
    } | null;
    profile?: {
        full_name?: string | null;
        avatar_url?: string | null;
        is_seller?: boolean | null;
    } | null;
    business?: {
        name?: string | null;
        logo_url?: string | null;
        city_name?: string | null;
        province_name?: string | null;
    } | null;
}

const navItems = [
    {
        name: 'Beranda Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Inventaris / Stok',
        href: '/dashboard/inventory',
        icon: Package,
    },
    {
        name: 'Hybrid Forecast',
        href: '/dashboard/forecast',
        icon: TrendingUp,
    },
    {
        name: 'AI Consultant',
        href: '/dashboard/ai-consultant',
        icon: Sparkles,
        badge: 'AI LORA',
    },
    {
        name: 'Event & Tren',
        href: '/dashboard/events',
        icon: Calendar,
    },
    {
        name: 'Pengaturan Toko',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export default function DashboardShell({
    children,
    user,
    profile,
    business,
}: DashboardShellProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'Pemilik UMKM';
    const shopName = business?.name || 'Toko UMKM Saya';
    const locationText = business?.city_name
        ? `${business.city_name}, ${business.province_name || ''}`
        : 'DIY & Jawa Tengah';

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-terracotta selection:text-white">
            {/* Overlay Mobile Sidebar Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR KIRI (Fixed / Sticky di Desktop) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-slate-800 ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Sidebar: Brand LORA Seller Centre */}
                <div className="p-5 border-b border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-terracotta to-amber-500 flex items-center justify-center shadow-lg shadow-terracotta/20 group-hover:scale-105 transition-transform">
                                <span className="text-white font-extrabold text-base tracking-wider font-outfit">L</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-outfit font-black tracking-tight text-white leading-none">
                                    LORA
                                </span>
                                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase mt-0.5">
                                    Seller Centre
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Shop Profile Info Card Box in Sidebar */}
                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
                        {business?.logo_url ? (
                            <img
                                src={business.logo_url}
                                alt={shopName}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
                                <Store className="w-5 h-5" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xs font-bold text-white truncate">{shopName}</h2>
                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-terracotta flex-shrink-0" />
                                <span className="truncate">{locationText}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigasi Utama Seller Centre */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Menu Manajemen Toko
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                                    isActive
                                        ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                                        }`}
                                    />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge ? (
                                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[9px] font-extrabold rounded-full border border-amber-400/30">
                                        {item.badge}
                                    </span>
                                ) : isActive ? (
                                    <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar: Kembali ke Katalog Toko & Quick Logout */}
                <div className="p-3 border-t border-slate-800 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Katalog Toko</span>
                    </Link>

                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer text-left"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar dari Seller</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* AREA KANAN (Header Top Bar & Dynamic Main Content) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Top Bar Minimalis */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            aria-label="Buka Menu Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-sm sm:text-base font-outfit font-extrabold text-slate-900 leading-none">
                                {shopName}
                            </h1>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Toko Toko Aktif</span>
                            </span>
                        </div>
                    </div>

                    {/* Right User Status */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-xs font-bold text-slate-900">{userName}</span>
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                                Seller / Pemilik UMKM
                            </span>
                        </div>

                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={userName}
                                className="w-9 h-9 rounded-2xl object-cover border border-slate-300 shadow-xs"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-terracotta to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </header>

                {/* Dynamic Main Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
