import { createClient } from '@/lib/supabase/server';
import {
  Users,
  Store,
  Package,
  DollarSign,
  ShoppingBag,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Shield
} from 'lucide-react';
import Link from 'next/link';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch aggregates
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalSellers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true);
  const { count: totalAdmins } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true);
  const { count: totalStores } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid');

  const totalRevenue = (ordersData || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // 2. Fetch Recent Orders (join profiles & businesses)
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      id, 
      total_amount, 
      created_at, 
      payment_status, 
      order_status,
      profiles (full_name),
      businesses (name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentOrders = (rawOrders || []).map(o => ({
    id: o.id,
    total_amount: Number(o.total_amount || 0),
    created_at: o.created_at,
    payment_status: o.payment_status || 'pending',
    order_status: o.order_status || 'pending',
    customerName: (o.profiles as any)?.full_name || 'Pelanggan LORA',
    businessName: (o.businesses as any)?.name || 'Toko UMKM',
  }));

  // 3. Fetch Recent Registered Users
  const { data: rawUsers } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, is_seller, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const recentUsers = (rawUsers || []).map(u => ({
    id: u.id,
    fullName: u.full_name,
    phone: u.phone_number || '-',
    isSeller: u.is_seller,
    isAdmin: u.is_admin,
    createdAt: u.created_at,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Ringkasan Statistik Sistem
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
          Pantau kesehatan platform LORA, pertumbuhan toko, aktivitas merchant, serta performa omzet regional DIY-Jateng secara real-time.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Omzet */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Omzet Platform</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{formatCurrency(totalRevenue)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Semua gerbang QRIS</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Toko Aktif */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Toko UMKM Terdaftar</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{totalStores || 0} Toko</h3>
            <span className="text-[10px] text-slate-500 font-bold">Tersebar di DIY & Jateng</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Total Pengguna */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pengguna Terdaftar</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{totalUsers || 0} Akun</h3>
            <span className="text-[10px] text-indigo-600 font-bold">
              {totalSellers || 0} Penjual | {totalAdmins || 0} Admin
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Total Produk */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Produk Katalog</p>
            <h3 className="text-lg sm:text-xl font-outfit font-black text-slate-900">{totalProducts || 0} Item</h3>
            <span className="text-[10px] text-amber-600 font-bold">
              Rata-rata {(totalProducts && totalStores) ? (totalProducts / totalStores).toFixed(1) : 0} produk/toko
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">5 Transaksi Terakhir</h2>
            </div>
            <Link
              href="/admin/transactions"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5">Pembeli / Toko</th>
                  <th className="py-2.5">Nominal</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {recentOrders.length > 0 ? (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <p className="font-bold text-slate-800">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{o.businessName}</p>
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-slate-800">{formatCurrency(o.total_amount)}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">
                          {new Date(o.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md ${
                          o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {o.payment_status === 'paid' ? 'LUNAS' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">
                      Belum ada transaksi di platform.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Pendaftaran Baru</h2>
            </div>
            <Link
              href="/admin/users-stores"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
            >
              <span>Kelola Pengguna</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5">Nama Pengguna</th>
                  <th className="py-2.5">Kontak</th>
                  <th className="py-2.5 text-right">Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {recentUsers.length > 0 ? (
                  recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <p className="font-bold text-slate-800">{u.fullName}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">
                          Daftar: {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="py-3 text-slate-500 font-semibold">{u.phone}</td>
                      <td className="py-3 text-right space-x-1">
                        {u.isAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-extrabold uppercase rounded-md">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                        {u.isSeller ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-extrabold uppercase rounded-md">
                            Seller
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 text-[8px] font-extrabold uppercase rounded-md">
                            Buyer
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">
                      Belum ada pendaftaran akun baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
