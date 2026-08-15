import Link from 'next/link';
import { Filter, PackageX } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/storefront/ProductCard';

interface BusinessRel {
    name: string;
    slug: string;
    city_name?: string | null;
    province_name?: string | null;
}

interface ProductWithBusiness {
    id: string;
    business_id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    price: number;
    stock: number;
    image_url?: string | null;
    is_active?: boolean | null;
    created_at?: string;
    businesses: BusinessRel | BusinessRel[] | null;
}

const categories = ['Semua Produk', 'Batik & Kain', 'Kuliner & Oleh-oleh', 'Kerajinan Tangan', 'Fashion & Aksesoris'];

/**
 * Server Component Katalog Utama Storefront LORA (/katalog)
 * Mengambil data produk aktif dari Supabase (join tabel businesses)
 */
export default async function KatalogPage() {
    const supabase = await createClient();

    // Data Fetching Supabase: products joined with businesses
    const { data: rawProducts, error } = await supabase
        .from('products')
        .select('*, businesses(name, slug, city_name, province_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const products: ProductWithBusiness[] = rawProducts || [];

    // Helper untuk mengekstrak relasi bisnis tunggal
    const getBusiness = (b: BusinessRel | BusinessRel[] | null): BusinessRel | null => {
        if (!b) return null;
        if (Array.isArray(b)) return b[0] || null;
        return b;
    };

    return (
        <div suppressHydrationWarning className="space-y-6 sm:space-y-8">
            {/* Header Hero Banner Katalog (Responsive Mobile Padding & Fonts) */}
            <div suppressHydrationWarning className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-10 shadow-xl">
                <div suppressHydrationWarning className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                        ✨ Regional UMKM Storefront
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-outfit font-extrabold tracking-tight leading-tight">
                        Katalog Produk LORA
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Jelajahi produk batik tulis, oleh-oleh kuliner khas, dan kerajinan seni dari pengrajin lokal Daerah Istimewa Yogyakarta & Jawa Tengah.
                    </p>
                </div>
            </div>

            {/* Category Filter Horizontal Pills */}
            <div suppressHydrationWarning className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 pr-1 flex-shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Kategori:
                </span>
                {categories.map((cat, idx) => (
                    <button
                        key={cat}
                        type="button"
                        className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${idx === 0
                                ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid Section */}
            <div suppressHydrationWarning className="space-y-3 sm:space-y-4">
                <div suppressHydrationWarning className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-outfit font-bold text-slate-900">
                        Rekomendasi Produk Unggulan
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        Menampilkan {products.length} Produk
                    </span>
                </div>

                {/* Status Kosong / Empty State */}
                {(!products || products.length === 0 || error) ? (
                    <div suppressHydrationWarning className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                        <PackageX className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">Belum Ada Produk Tersedia</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Produk unggulan UMKM Daerah Istimewa Yogyakarta & Jawa Tengah akan segera ditampilkan di katalog ini.
                        </p>
                    </div>
                ) : (
                    /* Grid Kartu Produk (Mobile 2 Kolom, Tablet 3 Kolom, Desktop 4 Kolom) */
                    <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {products.map((product) => {
                            const business = getBusiness(product.businesses);
                            const storeSlug = business?.slug || 'toko';
                            const storeName = business?.name || 'Toko UMKM';
                            const locationName = business?.city_name || business?.province_name || 'DIY & Jateng';

                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    storeSlug={storeSlug}
                                    storeName={storeName}
                                    locationName={locationName}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
