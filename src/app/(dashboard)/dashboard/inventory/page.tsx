import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Store, ChevronRight } from 'lucide-react';
import InventoryClient from '@/components/dashboard/InventoryClient';

export const revalidate = 0; // Disable cache to fetch fresh product list

export const metadata = {
  title: 'Inventaris & Stok ROP | LORA Seller Centre',
  description: 'Kelola stok produk, variasi harga, dan batas Reorder Point (ROP) toko UMKM Anda.',
};

export default async function InventoryOverviewPage() {
  const supabase = await createClient();

  // 1. Verifikasi Sesi
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

  // 4. Fetch Produk
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const products = (rawProducts || []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || 'Default',
    price: Number(p.price || 0),
    stock: Number(p.stock || 0),
    min_stock: Number(p.min_stock || 10),
    image_url: p.image_url || null,
    is_active: p.is_active !== false,
    created_at: p.created_at,
  }));

  return (
    <InventoryClient
      products={products}
      businessId={business.id}
    />
  );
}
