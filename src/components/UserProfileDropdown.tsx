'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';

interface UserProfileDropdownProps {
    user: {
        id: string;
        email?: string;
    };
    profile: {
        full_name?: string | null;
        is_seller?: boolean | null;
        is_buyer?: boolean | null;
    } | null;
}

export default function UserProfileDropdown({ user, profile }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ambil inisial nama atau email
    const name = profile?.full_name || user.email || 'Pengguna';
    const initial = name.charAt(0).toUpperCase();
    const roleText = profile?.is_seller ? 'Pemilik UMKM' : 'Pembeli';

    // Event listener untuk menutup dropdown saat mengklik di luar komponen
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tombol Profil Interaktif (Avatar Bundar) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all group focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="hidden sm:flex flex-col items-end text-left pr-1">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-terracotta transition-colors max-w-[120px] truncate">
                        {name}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium leading-none mt-0.5">
                        {roleText}
                    </span>
                </div>

                {/* Avatar Bundar dengan Inisial */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-terracotta/30 ring-2 ring-white">
                    {initial}
                </div>

                {/* Arrow Icon */}
                <svg
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Menu Dropdown Melayang */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                    {/* User Info Header Box */}
                    <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block px-2 py-0.5 bg-amber-100 border border-amber-300/60 text-amber-800 text-[10px] font-semibold rounded-md mt-1">
                            {roleText}
                        </span>
                    </div>

                    <div className="py-1">
                        {/* Menu Options */}
                        <Link
                            href="/akun"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
                        >
                            <span>⚙️</span>
                            <span>Pengaturan Profil</span>
                        </Link>

                        {profile?.is_seller ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
                            >
                                <span>🏪</span>
                                <span>Dashboard UMKM</span>
                            </Link>
                        ) : (
                            <Link
                                href="/buka-toko"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 rounded-xl transition-colors"
                            >
                                <span>🚀</span>
                                <span>Buka Toko UMKM Baru</span>
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        {/* Tombol Keluar */}
                        <form action={logout} onSubmit={() => { if (typeof window !== 'undefined') localStorage.removeItem('lora_global_cart'); }}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left"
                            >
                                <span>🚪</span>
                                <span>Keluar dari Akun</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
