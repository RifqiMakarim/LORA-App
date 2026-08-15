'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { login, loginWithGoogle } from '@/app/(auth)/actions';

function GoogleIcon() {
    return (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

function SpinnerIcon() {
    return (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
            {/* Ornamen Dekoratif Latar Belakang (Glassmorphism Vibe) */}
            <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-terracotta/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Kontainer Kartu Utama */}
            <div className="w-full max-w-5xl bg-surface/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo/10 overflow-hidden flex flex-col md:flex-row-reverse relative z-10 border border-slate-100/80 transition-all duration-500">

                {/* Sisi Kanan - Branding & Pesan (Disembunyikan di layar HP) */}
                <div className="hidden md:flex w-full md:w-5/12 bg-indigo p-10 text-white flex-col justify-between relative overflow-hidden">
                    {/* Pola Sorotan Halus */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-terracotta/30 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Bagian Atas (Branding) */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-terracotta animate-pulse"></span>
                            <h1 className="text-4xl font-outfit font-bold tracking-tight">LORA</h1>
                        </div>
                        <h2 className="text-2xl font-outfit font-bold mt-2">Senang Bertemu Anda Lagi</h2>
                        <p className="text-terracotta font-semibold tracking-wider text-xs uppercase mt-1">
                            LOCAL OMNI-CHANNEL REGIONAL ASSISTANT
                        </p>
                    </div>

                    {/* Bagian Tengah (Hero Image) */}
                    <div className="relative z-10 flex-grow flex items-center justify-center py-6">
                        <Image
                            src="/images/masuk.png"
                            alt="Ilustrasi Masuk LORA"
                            width={350}
                            height={350}
                            className="mx-auto drop-shadow-2xl object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Sisi Kiri - Formulir Login */}
                <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 bg-white">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-3xl font-outfit font-bold text-indigo mb-2">Masuk</h2>
                        <p className="text-slate-500 text-sm mb-8">Silakan masukkan email dan kata sandi Anda.</p>

                        <form action={formAction} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="anda@email.com"
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-indigo placeholder-slate-400 text-sm transition-all duration-300 hover:border-slate-300 focus:bg-white focus:border-terracotta focus:ring-4 focus:ring-terracotta/15 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="password">
                                        Kata Sandi
                                    </label>
                                    <Link href="#" className="text-xs font-semibold text-terracotta hover:underline transition-colors">
                                        Lupa kata sandi?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="Masukkan kata sandi Anda"
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-indigo placeholder-slate-400 text-sm transition-all duration-300 hover:border-slate-300 focus:bg-white focus:border-terracotta focus:ring-4 focus:ring-terracotta/15 focus:outline-none"
                                />
                            </div>

                            {/* Pesan Error Dinamis */}
                            {state?.error && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-status-danger text-sm font-medium flex items-start gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                                    <svg className="w-5 h-5 flex-shrink-0 text-status-danger mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="leading-snug">{state.error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-terracotta/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-6"
                            >
                                {isPending ? (
                                    <>
                                        <SpinnerIcon />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </form>

                        {/* Garis Pemisah Google OAuth (FR-001) */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Atau</span>
                            </div>
                        </div>

                        {/* Tombol Google OAuth */}
                        <form action={async () => {
                            await loginWithGoogle();
                        }}>
                            <button
                                type="submit"
                                className="w-full bg-white hover:bg-slate-50/80 text-slate-700 font-semibold py-3.5 rounded-xl border border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] flex items-center justify-center gap-3 text-sm"
                            >
                                <GoogleIcon />
                                <span>Lanjutkan dengan Google</span>
                            </button>
                        </form>

                        {/* Tautan ke Register */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-600">
                                Belum punya akun?{' '}
                                <Link href="/register" className="text-terracotta font-semibold hover:underline transition-colors">
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}