import Link from 'next/link';
import {
    BarChart3,
    TrendingUp,
    Package,
    Sparkles,
    ShoppingBag,
    ArrowUpRight,
    Users
} from 'lucide-react';

export default function DashboardOverviewPage() {
    return (
        <div className="space-y-8">
            {/* Top Welcome Banner */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                    🏪 Seller Centre - Dashboard UMKM
                </div>
                <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
                    Selamat Datang di Dashboard Toko Anda
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
                    Pantau kinerja penjualan, stok inventaris, proyeksi omzet AI, dan rekomendasi event regional DIY-Jateng secara real-time.
                </p>
            </div>

            {/* KPI Metric Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Omzet Bulan Ini</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-outfit font-extrabold text-slate-900">Rp 12.850.000</p>
                    <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +14.2% dibanding bulan lalu
                    </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Pesanan Sukses</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-outfit font-extrabold text-slate-900">86 Pesanan</p>
                    <p className="text-[11px] font-medium text-slate-500">8 pesanan dalam proses</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Produk Aktif</span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-outfit font-extrabold text-slate-900">24 Item</p>
                    <p className="text-[11px] font-medium text-slate-500">3 item mendekati batas ROP</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Pelanggan Unik</span>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-outfit font-extrabold text-slate-900">142 Orang</p>
                    <p className="text-[11px] font-medium text-slate-500">Pelanggan di DIY & Jateng</p>
                </div>
            </div>

            {/* Quick Actions & AI Recommendation Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Assistant Quick Banner */}
                <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5" /> Asisten AI LORA
                        </span>
                        <h2 className="text-xl sm:text-2xl font-outfit font-bold">
                            Analisis & Rekomendasi Stok ROP Toko Anda
                        </h2>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                            Gunakan LORA AI Consultant untuk mendeteksi tren permintaan batik & oleh-oleh menjelang event daerah terdekat.
                        </p>
                    </div>

                    <div>
                        <Link
                            href="/dashboard/ai-consultant"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-2xl shadow-lg shadow-terracotta/30 transition-all hover:scale-[1.02]"
                        >
                            <span>Konsultasi dengan AI LORA</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Menu Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Aksi Cepat Seller</h3>
                    <div className="space-y-2">
                        <Link
                            href="/dashboard/inventory"
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-colors group"
                        >
                            <span className="text-xs font-bold text-slate-800">Kelola Inventaris & Stok</span>
                            <span className="text-xs text-slate-400 group-hover:text-terracotta">→</span>
                        </Link>

                        <Link
                            href="/dashboard/forecast"
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-colors group"
                        >
                            <span className="text-xs font-bold text-slate-800">Lihat Proyeksi Forecast</span>
                            <span className="text-xs text-slate-400 group-hover:text-terracotta">→</span>
                        </Link>

                        <Link
                            href="/dashboard/events"
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-colors group"
                        >
                            <span className="text-xs font-bold text-slate-800">Kalender Event Regional</span>
                            <span className="text-xs text-slate-400 group-hover:text-terracotta">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
