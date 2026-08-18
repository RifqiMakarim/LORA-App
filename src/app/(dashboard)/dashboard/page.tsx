import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Store, Sparkles, ChevronRight } from 'lucide-react';
import {
  calculateBusinessHealthScore,
  getDeterministicBhsRecommendation,
} from '@/lib/engines/bhs-engine';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const revalidate = 0; // Disable caching agar dashboard selalu up-to-date

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  // 1. Verifikasi User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
        <Store className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-850">Akses Ditolak</h2>
        <p className="text-slate-500 text-sm max-w-sm">Anda harus login terlebih dahulu untuk mengakses menu ini.</p>
        <Link href="/login" className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-2xl">Login Sekarang</Link>
      </div>
    );
  }

  // 2. Fetch Toko
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  // 3. Render State: Belum memiliki toko
  if (!business) {
    return (
      <div className="max-w-xl mx-auto my-8 sm:my-16">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-terracotta text-white flex items-center justify-center shadow-lg mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-outfit font-extrabold text-slate-900 tracking-tight">
              Buka Toko UMKM LORA Anda
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Anda terdaftar sebagai Pembeli. Untuk mulai memantau laporan keuangan, mengelola stok produk, melihat ROP, dan memanfaatkan asisten AI, silakan daftarkan toko UMKM Anda terlebih dahulu.
            </p>
          </div>
          <div>
            <Link
              href="/buka-toko"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-2xl shadow-lg shadow-terracotta/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Daftarkan Toko Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Fetch data terkait untuk toko (Lama lookback: 90 hari)
  // =========================================================================
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - 90);

  // Fetch Order
  const { data: rawOrders } = await supabase
    .from('orders')
    .select('id, total_amount, created_at, customer_id, payment_status, order_status, order_items(quantity)')
    .eq('business_id', business.id)
    .gte('created_at', lookbackDate.toISOString())
    .order('created_at', { ascending: false });

  // Fetch Produk
  const { data: rawProducts } = await supabase
    .from('products')
    .select('id, stock, price, is_active')
    .eq('business_id', business.id);

  // Fetch Local Events
  const { data: rawEvents } = await supabase
    .from('local_events')
    .select('id, title, province_name, start_date, end_date, expected_tourist_impact')
    .order('start_date', { ascending: true });

  // Fetch Impresi Etalase
  const { data: rawAnalytics } = await supabase
    .from('storefront_analytics')
    .select('page_impressions, product_clicks, date')
    .eq('business_id', business.id)
    .gte('date', lookbackDate.toISOString());

  // =========================================================================
  // 5. Agregasi & Normalisasi Data
  // =========================================================================
  const orders = (rawOrders || []).map(o => ({
    id: o.id,
    total_amount: Number(o.total_amount || 0),
    created_at: o.created_at,
    customer_id: o.customer_id,
    payment_status: o.payment_status || 'pending',
    order_status: o.order_status || 'pending',
  }));

  const products = (rawProducts || []).map(p => ({
    id: p.id,
    stock: Number(p.stock || 0),
    min_stock: Number((p as any).min_stock || 10),
    price: Number(p.price || 0),
    is_active: p.is_active !== false,
  }));

  const localEvents = (rawEvents || []).map(e => ({
    id: e.id,
    title: e.title,
    province_name: e.province_name,
    start_date: e.start_date,
    end_date: e.end_date,
    expected_tourist_impact: (e.expected_tourist_impact as 'low' | 'medium' | 'high' | 'massive') || 'medium',
  }));

  // Waktu filter pembanding
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // Filter order 30 hari terakhir (Sukses: paid / completed / processing)
  const orders30d = orders.filter(o => {
    const oDate = new Date(o.created_at);
    const isRecent = oDate >= thirtyDaysAgo;
    const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
    return isRecent && isSuccessful;
  });

  // Filter order periode 60-30 hari lalu untuk perbandingan MoM
  const ordersCompare = orders.filter(o => {
    const oDate = new Date(o.created_at);
    const isCompareRange = oDate >= sixtyDaysAgo && oDate < thirtyDaysAgo;
    const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
    return isCompareRange && isSuccessful;
  });

  // Hitung KPI Utama
  const totalRevenue = orders30d.reduce((sum, o) => sum + o.total_amount, 0);
  const totalRevenueCompare = ordersCompare.reduce((sum, o) => sum + o.total_amount, 0);

  const orderCount = orders30d.length;
  const orderCountCompare = ordersCompare.length;

  const activeProductCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => p.is_active && p.stock <= p.min_stock).length;

  // Hitung total impresi 30 hari terakhir vs pembanding
  const analytics30d = (rawAnalytics || []).filter(a => new Date(a.date) >= thirtyDaysAgo);
  const analyticsCompare = (rawAnalytics || []).filter(a => {
    const aDate = new Date(a.date);
    return aDate >= sixtyDaysAgo && aDate < thirtyDaysAgo;
  });

  const totalImpressions = analytics30d.reduce((sum, a) => sum + Number(a.page_impressions || 0), 0);
  const totalImpressionsCompare = analyticsCompare.reduce((sum, a) => sum + Number(a.page_impressions || 0), 0);

  // Hitung jumlah item produk terjual 30 hari terakhir
  let soldQuantity30Days = 0;
  if (rawOrders && rawOrders.length > 0) {
    rawOrders.forEach(o => {
      const oDate = new Date(o.created_at);
      const isRecent = oDate >= thirtyDaysAgo;
      const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
      
      if (isRecent && isSuccessful && o.order_items) {
        const itemsArray = Array.isArray(o.order_items) ? o.order_items : [o.order_items];
        itemsArray.forEach((item: any) => {
          soldQuantity30Days += Number(item.quantity || 0);
        });
      }
    });
  }

  // =========================================================================
  // 6. Hitung Business Health Score (BHS)
  // =========================================================================
  
  // Cari di DB terlebih dahulu
  const { data: savedBhs } = await supabase
    .from('business_health_scores')
    .select('*')
    .eq('business_id', business.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let bhsData;

  if (savedBhs) {
    bhsData = {
      overall_score: Number(savedBhs.overall_score),
      revenue_score: Number(savedBhs.revenue_score),
      margin_score: Number(savedBhs.margin_score),
      inventory_turn_score: Number(savedBhs.inventory_turn_score),
      retention_score: Number(savedBhs.retention_score),
      safety_stock_score: Number(savedBhs.safety_stock_score),
      event_adaptability_score: Number(savedBhs.event_adaptability_score),
      ai_narrative: savedBhs.ai_narrative || '',
    };
  } else {
    // Jalankan kalkulasi on-the-fly jika belum pernah disimpan
    const calculated = calculateBusinessHealthScore({
      orders,
      products,
      localEvents,
      businessProvince: business.province_name,
      soldQuantity30Days,
    });

    const deterministicRecs = getDeterministicBhsRecommendation(calculated);
    const fallbackNarrative = deterministicRecs.join(' ');

    bhsData = {
      ...calculated,
      ai_narrative: fallbackNarrative,
    };

    // Simpan hasil kalkulasi awal agar tidak kosong
    await supabase.from('business_health_scores').insert({
      business_id: business.id,
      overall_score: calculated.overall_score,
      revenue_score: calculated.revenue_score,
      margin_score: calculated.margin_score,
      inventory_turn_score: calculated.inventory_turn_score,
      retention_score: calculated.retention_score,
      safety_stock_score: calculated.safety_stock_score,
      event_adaptability_score: calculated.event_adaptability_score,
      ai_narrative: fallbackNarrative,
      calculated_at: new Date().toISOString(),
    });
  }

  // =========================================================================
  // 7. Siapkan Data Tren Grafik (30 Hari Terakhir)
  // =========================================================================
  const salesGroupMap = new Map<string, { revenue: number; orders: number }>();
  
  // Inisialisasi 30 hari kosong agar visualisasi tidak putus
  const chartToday = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(chartToday);
    d.setDate(chartToday.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    salesGroupMap.set(dStr, { revenue: 0, orders: 0 });
  }

  // Masukkan data transaksi riil 30 hari terakhir
  orders.forEach(o => {
    const oDate = new Date(o.created_at);
    const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
    if (isSuccessful && oDate >= thirtyDaysAgo) {
      const dateStr = oDate.toISOString().split('T')[0];
      if (salesGroupMap.has(dateStr)) {
        const current = salesGroupMap.get(dateStr)!;
        current.revenue += o.total_amount;
        current.orders += 1;
      }
    }
  });

  const dailySales = Array.from(salesGroupMap.entries()).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    orders: val.orders,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <DashboardClient
      business={business}
      kpis={{
        totalRevenue,
        totalRevenueCompare,
        orderCount,
        orderCountCompare,
        activeProductCount,
        lowStockCount,
        totalImpressions,
        totalImpressionsCompare,
      }}
      bhs={bhsData}
      dailySales={dailySales}
    />
  );
}
