import Link from 'next/link';
import { PackageX, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/storefront/ProductCard';
import KatalogFilter from '@/components/storefront/KatalogFilter';

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

interface KatalogPageProps {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component Katalog Utama Storefront LORA (/katalog)
 * Membaca searchParams URL, melakukan pencarian & filter kategori secara dinamis dari Supabase
 */
export default async function KatalogPage({ searchParams }: KatalogPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const searchRaw = (resolvedSearchParams.q as string) || (resolvedSearchParams.search as string) || '';
    const categoryRaw = (resolvedSearchParams.category as string) || '';

    const searchTerm = searchRaw.trim();
    const categoryTerm = categoryRaw.trim();

    const supabase = await createClient();

    // Ambil kategori unik yang aktif di database secara dinamis
    const { data: catData } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);
    
    const uniqueCats = Array.from(
        new Set((catData || []).map((p) => p.category).filter((c): c is string => !!c))
    ).sort();
    
    const categories = ['Semua Produk', ...uniqueCats];

    // Inisialisasi Dynamic Query Supabase
    let query = supabase
        .from('products')
        .select('*, businesses(name, slug, city_name, province_name)')
        .eq('is_active', true);

    // Filter Pencarian Teks (ilike pada nama atau deskripsi produk)
    if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Filter Kategori Produk
    if (categoryTerm && categoryTerm !== 'Semua Produk' && categoryTerm !== 'Semua') {
        query = query.eq('category', categoryTerm);
    }

    // Eksekusi Query
    const { data: rawProducts, error } = await query.order('created_at', { ascending: false });
    const products: ProductWithBusiness[] = rawProducts || [];

    // Helper mengekstrak data relasi bisnis tunggal
    const getBusiness = (b: BusinessRel | BusinessRel[] | null): BusinessRel | null => {
        if (!b) return null;
        if (Array.isArray(b)) return b[0] || null;
        return b;
    };

    return (
        <div suppressHydrationWarning className="space-y-6 sm:space-y-8">
            {/* Header Hero Banner Katalog */}
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

            {/* Client Component: Search Bar & Category Filter Bar */}
            <KatalogFilter categories={categories} />

            {/* Product Grid Section Header */}
            <div suppressHydrationWarning className="space-y-4">
                <div suppressHydrationWarning className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-outfit font-bold text-slate-900">
                        {categoryTerm && categoryTerm !== 'Semua Produk'
                            ? `Kategori: ${categoryTerm}`
                            : searchTerm
                            ? `Hasil Pencarian: "${searchTerm}"`
                            : 'Rekomendasi Produk Unggulan'}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        Menampilkan {products.length} Produk
                    </span>
                </div>

                {/* Status Kosong / Empty State (Jika produk tidak ditemukan) */}
                {(!products || products.length === 0 || error) ? (
                    <div suppressHydrationWarning className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <PackageX className="w-8 h-8" />
                        </div>
                        <div className="space-y-1.5 max-w-md mx-auto">
                            <h3 className="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Produk tidak ditemukan. Coba gunakan kata kunci atau kategori lain.
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-2xl text-xs font-bold shadow-md shadow-terracotta/25 transition-all"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter & Lihat Semua Produk</span>
                            </Link>
                        </div>
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
