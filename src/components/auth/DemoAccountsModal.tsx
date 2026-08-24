'use client';

import React, { useState } from 'react';
import { ShieldCheck, Store, ShoppingBag, X, Sparkles, Check, ArrowRight, Info } from 'lucide-react';

export interface DemoAccount {
    id: string;
    roleCategory: 'admin' | 'seller' | 'buyer';
    roleTitle: string;
    name: string;
    email: string;
    password: string;
    badge: string;
    badgeColor: string;
    location?: string;
    description: string;
    highlights: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
    // 1. Super Admin
    {
        id: 'admin',
        roleCategory: 'admin',
        roleTitle: 'Super Admin LORA',
        name: 'Super Admin Platform',
        email: 'admin@lora.id',
        password: 'LoraApp2026!',
        badge: 'Platform Governor',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        location: 'Yogyakarta & Jawa Tengah',
        description: 'Akses penuh tata kelola ekosistem LORA regional DIY-Jateng, verifikasi toko UMKM, dan monitoring agregat.',
        highlights: [
            'Backoffice Administrator',
            'Verifikasi & Validasi UMKM Baru',
            'Monitoring Transaksi Regional DIY-Jateng',
            'Manajemen Voucher Platform'
        ]
    },

    // 2. Seller UMKM
    {
        id: 'seller-batik',
        roleCategory: 'seller',
        roleTitle: 'Seller Batik Daniswara',
        name: 'Rangga Daniswara',
        email: 'seller.batik@lora.id',
        password: 'LoraApp2026!',
        badge: 'Fashion & Kriya',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        location: 'Sleman, D.I. Yogyakarta',
        description: 'UMKM Batik Tulis & Cap kontemporer khas Yogyakarta dengan integrasi AI Forecasting dan sistem ROP.',
        highlights: [
            'Dashboard Seller Interaktif',
            'AI Forecaster & LORA Business Health',
            'Sistem Peringatan Stok (ROP Alert)',
            'Segmentasi Pelanggan RFM'
        ]
    },
    {
        id: 'seller-gerabah',
        roleCategory: 'seller',
        roleTitle: 'Seller Gerabah Kasongan',
        name: 'Bambang Sutrisno',
        email: 'seller.gerabah@lora.id',
        password: 'LoraApp2026!',
        badge: 'Kerajinan Tanah Liat',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        location: 'Kasongan, Bantul, D.I. Yogyakarta',
        description: 'Pengrajin gerabah dan tembikar tradisional Bantul dengan aneka vas, pot estetik, dan souvenir seni.',
        highlights: [
            'Manajemen Katalog Kerajinan Lokal',
            'Pencatatan Pesanan Masuk',
            'Analisis Kesehatan Usaha (BHS)',
            'Pemasaran Berbasis Wilayah'
        ]
    },
    {
        id: 'seller-bakpia',
        roleCategory: 'seller',
        roleTitle: 'Seller Bakpia Pathok',
        name: 'Endang Sri Wahyuni',
        email: 'seller.bakpia@lora.id',
        password: 'LoraApp2026!',
        badge: 'Kuliner Khas Jogja',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        location: 'Pathok, Kota Yogyakarta',
        description: 'Produsen Bakpia legendaris dengan aneka varian rasa khas Yogyakarta dan perputaran stok cepat.',
        highlights: [
            'Monitoring Produk Cepat Kadaluarsa/Habis',
            'Kalkulasi Reorder Point (ROP) Bahan Baku',
            'Broadcast Promo ke Segmen Pelanggan',
            'Integrasi AI Rekomendasi Bisnis'
        ]
    },
    {
        id: 'seller-jepara',
        roleCategory: 'seller',
        roleTitle: 'Seller Ukiran Jati Jepara',
        name: 'Haji Ahmad Fauzi',
        email: 'seller.jepara@lora.id',
        password: 'LoraApp2026!',
        badge: 'Mebel & Ukir Kayu',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        location: 'Jepara, Jawa Tengah',
        description: 'Pusat ukiran kayu jati dan mebel berkualitas tinggi khas pesisir utara Jawa Tengah.',
        highlights: [
            'Manajemen Produk Bernilai Tinggi',
            'Riwayat Transaksi & Pelacakan Order',
            'Penyelarasan Event Kebudayaan Lokal',
            'Katalog Visual High-Definition'
        ]
    },
    {
        id: 'seller-semarang',
        roleCategory: 'seller',
        roleTitle: 'Seller Bandeng Juwana',
        name: 'Dewi Sartika',
        email: 'seller.semarang@lora.id',
        password: 'LoraApp2026!',
        badge: 'Kuliner Pesisir Jateng',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        location: 'Semarang, Jawa Tengah',
        description: 'Kuliner olahan bandeng presto ikonik Semarang dengan jaringan pembeli aktif dan repeat order tinggi.',
        highlights: [
            'Analisis Repeat Order & Retensi',
            'Manajemen Voucher & Promosi Toko',
            'Konsultasi Chatbot AI LORA 24/7',
            'Pantau Performa Penjualan Harian'
        ]
    },

    // 3. Buyer / Pembeli
    {
        id: 'buyer-champions',
        roleCategory: 'buyer',
        roleTitle: 'Buyer (Champions RFM)',
        name: 'Raden Mas Danang Kusuma',
        email: 'danang.kusuma@gmail.com',
        password: 'LoraApp2026!',
        badge: 'Segmen Champions',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        location: 'Yogyakarta',
        description: 'Pelanggan setia berbelanja frekuensi tinggi dengan skor RFM tertinggi dan kupon diskon VIP.',
        highlights: [
            'Akses Katalog Produk Budaya Lengkap',
            'Voucher Eksklusif Segmen Champions',
            'Checkout Cepat & Riwayat Belanja',
            'Tracking Transaksi & Resi'
        ]
    },
    {
        id: 'buyer-loyal',
        roleCategory: 'buyer',
        roleTitle: 'Buyer (Loyal Customer)',
        name: 'Siti Nurhaliza Rahayu',
        email: 'siti.nurhaliza.r@gmail.com',
        password: 'LoraApp2026!',
        badge: 'Segmen Loyal',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        location: 'Solo, Jawa Tengah',
        description: 'Pelanggan aktif yang rutin membeli produk kriya dan kuliner khas daerah DIY-Jateng.',
        highlights: [
            'Jelajah UMKM Lokal & Event Daerah',
            'Penukaran Voucher Promosi Toko',
            'Ulasan Produk & Rating Toko',
            'Simpan Produk Favorit'
        ]
    },
    {
        id: 'buyer-new',
        roleCategory: 'buyer',
        roleTitle: 'Buyer (New Customer)',
        name: 'Gita Gutawa Permata',
        email: 'gita.permata@gmail.com',
        password: 'LoraApp2026!',
        badge: 'Segmen New Customer',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        location: 'Semarang, Jawa Tengah',
        description: 'Pembeli baru yang baru pertama kali mendaftar dan menjelajahi ekosistem marketplace LORA.',
        highlights: [
            'Eksplorasi Katalog Interaktif',
            'Promo Sambutan Pengguna Baru',
            'Pencarian Berdasarkan Kategori & Wilayah',
            'Integrasi Keranjang Belanja Simpel'
        ]
    }
];

interface DemoAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAccount: (email: string, password: string, roleName: string) => void;
}

export default function DemoAccountsModal({ isOpen, onClose, onSelectAccount }: DemoAccountsModalProps) {
    const [activeTab, setActiveTab] = useState<'seller' | 'admin' | 'buyer'>('seller');

    if (!isOpen) return null;

    const filteredAccounts = DEMO_ACCOUNTS.filter(acc => acc.roleCategory === activeTab);

    const handleSelect = (account: DemoAccount) => {
        onSelectAccount(account.email, account.password, account.roleTitle);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Box */}
            <div 
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta/20 text-amber-300 border border-terracotta/40">
                                <Sparkles className="w-3.5 h-3.5" />
                                Mode Evaluasi & Presentasi
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-outfit font-bold tracking-tight text-white">
                            Pilih Akun Demo LORA
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">
                            Pilih salah satu profil untuk langsung mengisi formulir login secara instan.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative z-10 flex-shrink-0"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200/80 flex gap-2 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('seller')}
                        className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'seller'
                                ? 'bg-white text-indigo shadow-sm border border-slate-200 font-semibold ring-1 ring-terracotta/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <Store className={`w-4 h-4 ${activeTab === 'seller' ? 'text-terracotta' : 'text-slate-400'}`} />
                        <span>Seller UMKM ({DEMO_ACCOUNTS.filter(a => a.roleCategory === 'seller').length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'admin'
                                ? 'bg-white text-indigo shadow-sm border border-slate-200 font-semibold ring-1 ring-terracotta/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-terracotta' : 'text-slate-400'}`} />
                        <span>Super Admin ({DEMO_ACCOUNTS.filter(a => a.roleCategory === 'admin').length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('buyer')}
                        className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'buyer'
                                ? 'bg-white text-indigo shadow-sm border border-slate-200 font-semibold ring-1 ring-terracotta/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <ShoppingBag className={`w-4 h-4 ${activeTab === 'buyer' ? 'text-terracotta' : 'text-slate-400'}`} />
                        <span>Buyer RFM ({DEMO_ACCOUNTS.filter(a => a.roleCategory === 'buyer').length})</span>
                    </button>
                </div>

                {/* Account Cards List */}
                <div className="p-6 overflow-y-auto space-y-4 max-h-[50vh] bg-slate-50/50">
                    {filteredAccounts.map((account) => (
                        <div
                            key={account.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-terracotta/40 transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-2 flex-grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-outfit font-bold text-base sm:text-lg text-slate-800">
                                        {account.roleTitle}
                                    </span>
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${account.badgeColor}`}>
                                        {account.badge}
                                    </span>
                                    {account.location && (
                                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                            📍 {account.location}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {account.description}
                                </p>

                                {/* Kredensial Bar */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
                                        <span className="text-slate-400 font-sans text-[11px]">Email:</span>
                                        <span className="font-semibold text-indigo">{account.email}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
                                        <span className="text-slate-400 font-sans text-[11px]">Kata Sandi:</span>
                                        <span className="font-semibold text-slate-700">{account.password}</span>
                                    </div>
                                </div>

                                {/* Highlight Fitur */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                                    {account.highlights.map((h, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span>{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex md:flex-col items-center justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <button
                                    onClick={() => handleSelect(account)}
                                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <span>Gunakan Akun Ini</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="p-4 bg-slate-100/90 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-terracotta flex-shrink-0" />
                        <span>Data akun demo bersumber dari seed resmi MVP LORA (DIY & Jateng).</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
