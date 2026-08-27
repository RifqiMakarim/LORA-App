import Link from 'next/link';
import { PackageX, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis';
import ProductCard from '@/components/storefront/ProductCard';
import KatalogFilter from '@/components/storefront/KatalogFilter';
import KatalogBannerSlider from '@/components/storefront/KatalogBannerSlider';
import Pagination from '@/components/ui/Pagination';

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

interface CachedFilters {
    categoriesList: string[];
    availableCities: string[];
}

interface KatalogPageProps {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component Katalog Utama Storefront LORA (/katalog)
 * Menggunakan Upstash Redis Caching (Cache-Aside pattern) untuk data Filter & Produk
 * Membaca searchParams URL, melakukan pencarian, filter kategori, serta filter Kota Dinamis
 */
export default async function KatalogPage({ searchParams }: KatalogPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const searchRaw = (resolvedSearchParams.q as string) || (resolvedSearchParams.search as string) || '';
    const categoryRaw = (resolvedSearchParams.category as string) || '';
    const cityName = ((resolvedSearchParams.city_name as string) || (resolvedSearchParams.city as string) || '').trim();
    const regionRaw = (resolvedSearchParams.region as string) || '';

    const searchTerm = searchRaw.trim();
    const categoryTerm = categoryRaw.trim();
    const regionTerm = regionRaw.trim();

    const supabase = await createClient();

    // 1. Caching Data Filter (Kategori & Kota) - Pola Cache-Aside
    // Key: 'katalog:filters', TTL: 24 Jam (86400 detik)
    const FILTER_CACHE_KEY = 'katalog:filters';
    let categoriesList: string[] = [];
    let availableCities: string[] = [];

    try {
        const cachedFilters = await redis.get<CachedFilters>(FILTER_CACHE_KEY);
        if (cachedFilters && Array.isArray(cachedFilters.categoriesList) && Array.isArray(cachedFilters.availableCities)) {
            categoriesList = cachedFilters.categoriesList;
            availableCities = cachedFilters.availableCities;
        }
    } catch (err) {
        console.error('Redis filter cache fetch error:', err);
    }

    if (categoriesList.length === 0 || availableCities.length === 0) {
        // Cache Miss: Query Supabase
        const [categoriesResponse, citiesResponse] = await Promise.all([
            supabase.from('product_categories').select('name'),
            supabase.from('businesses').select('city_name').not('city_name', 'is', null),
        ]);

        const rawCategories = categoriesResponse.data || [];
        const rawCities = citiesResponse.data || [];

        const uniqueCategoryNames: string[] = Array.from(
            new Set(
                rawCategories
                    .map(c => c.name?.trim())
                    .filter((name): name is string => Boolean(name && name.length > 0))
            )
        ).sort();

        const uniqueCatsFiltered = uniqueCategoryNames.filter(c => c.toLowerCase() !== 'lainnya');
        categoriesList = ['Semua Produk', ...uniqueCatsFiltered];

        if (uniqueCategoryNames.some(c => c.toLowerCase() === 'lainnya')) {
            categoriesList.push('Lainnya');
        }

        availableCities = Array.from(
            new Set(
                rawCities
                    .map(b => b.city_name?.trim())
                    .filter((city): city is string => Boolean(city && city.length > 0))
            )
        ).sort();

        try {
            await redis.set(FILTER_CACHE_KEY, { categoriesList, availableCities }, { ex: 86400 });
        } catch (err) {
            console.error('Redis filter cache save error:', err);
        }
    }

    // 2. Caching Data Produk E-Commerce - Pola Cache-Aside
    // Key Dinamis: katalog:products:q=${searchTerm}:c=${categoryTerm}, TTL: 5 Menit (300 detik)
    const productCacheKey = `katalog:products:q=${searchTerm}:c=${categoryTerm}`;
    let rawProducts: ProductWithBusiness[] | null = null;
    let queryError: any = null;

    try {
        rawProducts = await redis.get<ProductWithBusiness[]>(productCacheKey);
    } catch (err) {
        console.error('Redis product cache fetch error:', err);
    }

    if (!rawProducts) {
        // Cache Miss: Jalankan query Supabase ke tabel products (termasuk relasi businesses)
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

        const { data, error } = await query.order('created_at', { ascending: false });
        queryError = error;

        if (!error && data) {
            rawProducts = data as ProductWithBusiness[];
            try {
                await redis.set(productCacheKey, rawProducts, { ex: 300 });
            } catch (err) {
                console.error('Redis product cache save error:', err);
            }
        } else {
            rawProducts = [];
        }
    }

    // Helper mengekstrak data relasi bisnis tunggal
    const getBusiness = (b: BusinessRel | BusinessRel[] | null): BusinessRel | null => {
        if (!b) return null;
        if (Array.isArray(b)) return b[0] || null;
        return b;
    };

    // 3. Logika Klien Post-Fetch: Filter Wilayah (Kota/Region) & Sorting Stok
    let filteredProducts = [...(rawProducts || [])];

    // Filter Kota / Wilayah
    if (cityName) {
        filteredProducts = filteredProducts.filter(p => {
            const b = getBusiness(p.businesses);
            const cName = b?.city_name || '';
            return cName.toLowerCase().includes(cityName.toLowerCase());
        });
    } else if (regionTerm && regionTerm !== 'Semua Wilayah' && regionTerm !== 'Semua') {
        filteredProducts = filteredProducts.filter(p => {
            const b = getBusiness(p.businesses);
            const cName = b?.city_name || '';
            const pName = b?.province_name || '';
            const term = regionTerm.toLowerCase();
            return cName.toLowerCase().includes(term) || pName.toLowerCase().includes(term);
        });
    }

    // Sorting Produk: Stok habis (stock <= 0) diletakkan paling bawah
    filteredProducts.sort((a, b) => {
        const aInStock = (a.stock ?? 0) > 0;
        const bInStock = (b.stock ?? 0) > 0;
        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;
        return 0;
    });

    // 4. Setup Paginasi
    const ITEMS_PER_PAGE = 16;
    const rawPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const currentPage = Math.min(rawPage, totalPages);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(from, to);

    const activeLocationLabel = cityName || (regionTerm !== 'Semua Wilayah' ? regionTerm : '');

    return (
        <div suppressHydrationWarning className="space-y-6 sm:space-y-8">
            {/* Header Hero Banner Slider Telkomsel-Style */}
            <KatalogBannerSlider />

            {/* Client Component: Search Bar, Category, & Integrated Dynamic Location Filter */}
            <KatalogFilter categories={categoriesList} availableCities={availableCities} />

            {/* Product Grid Section Header */}
            <div id="katalog-grid" suppressHydrationWarning className="space-y-6 scroll-mt-24">
                <div suppressHydrationWarning className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-outfit font-bold text-slate-900">
                        {activeLocationLabel
                            ? `Kota: ${activeLocationLabel} ${categoryTerm && categoryTerm !== 'Semua Produk' ? `• Kategori: ${categoryTerm}` : ''}`
                            : categoryTerm && categoryTerm !== 'Semua Produk'
                                ? `Kategori: ${categoryTerm}`
                                : searchTerm
                                    ? `Hasil Pencarian: "${searchTerm}"`
                                    : 'Rekomendasi Produk Unggulan'}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        Total {totalItems} Produk
                    </span>
                </div>

                {/* Status Kosong / Empty State (Jika produk tidak ditemukan) */}
                {(!paginatedProducts || paginatedProducts.length === 0 || queryError) ? (
                    <div suppressHydrationWarning className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <PackageX className="w-8 h-8" />
                        </div>
                        <div className="space-y-1.5 max-w-md mx-auto">
                            <h3 className="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Produk tidak ditemukan untuk kriteria filter ini. Coba gunakan kata kunci, kategori, atau kota lain.
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
                    <>
                        {/* Grid Kartu Produk (Mobile 2 Kolom, Tablet 3 Kolom, Desktop 4 Kolom) */}
                        <div suppressHydrationWarning className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {paginatedProducts.map((product) => {
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

                        {/* Komponen Paginasi */}
                        {totalPages > 1 && (
                            <div className="pt-4 border-t border-slate-200/80">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    scrollAnchor="katalog-grid"
                                    itemLabel="produk"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}