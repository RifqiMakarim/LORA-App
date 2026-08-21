'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    MapPin,
    Search,
    X,
    Store,
    CheckCircle2,
    PackageX,
    ExternalLink,
    Sparkles,
    Share2,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '@/components/storefront/ProductCard';
import Pagination from '@/components/ui/Pagination';

export interface BusinessData {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    description?: string | null;
    province_name?: string | null;
    city_name?: string | null;
    district_name?: string | null;
    village_name?: string | null;
    address?: string | null;
    google_maps_link?: string | null;
    contact_number?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
}

export interface ProductData {
    id: string;
    business_id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    price: number;
    stock: number;
    min_stock: number;
    image_url?: string | null;
    is_active?: boolean | null;
}

interface TokoStorefrontViewProps {
    business: BusinessData;
    products: ProductData[];
}

export default function TokoStorefrontView({ business, products }: TokoStorefrontViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const ITEMS_PER_PAGE = 12;

    // Share Store Link
    const handleShareStore = () => {
        if (navigator.share) {
            navigator.share({
                title: business.name,
                text: `Kunjungi etalase UMKM ${business.name} di LORA Storefront!`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('📋 Tautan toko berhasil disalin!');
        }
    };

    // Extract unique categories
    const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))];

    // Filter products by search and category
    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Location display helper
    const locationString = [business.village_name, business.district_name, business.city_name, business.province_name]
        .filter(Boolean)
        .join(', ') || 'DI Yogyakarta & Jawa Tengah';

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Back Button Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-terracotta bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-x-0.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Kembali ke Katalog Utama</span>
                    <span className="sm:hidden">Katalog</span>
                </Link>

                <button
                    type="button"
                    onClick={handleShareStore}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5 text-terracotta" />
                    <span>Bagikan Toko</span>
                </button>
            </div>

            {/* Header Etalase UMKM (Hero Banner + Logo + Info Business Profile dengan Kontras Font Putih Tinggi) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all text-white">
                    {/* Storefront Banner */}
                    <div className="relative h-36 sm:h-64 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 overflow-hidden">
                        {business.banner_url ? (
                            <img
                                src={business.banner_url}
                                alt={`Banner ${business.name}`}
                                className="w-full h-full object-cover opacity-85"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-30">
                                <Store className="w-24 h-24 sm:w-32 sm:h-32 text-amber-300 stroke-1" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Storefront Identity & Profile Details */}
                    <div className="relative px-4 pb-5 pt-3 sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 -mt-12 sm:-mt-20">
                        {/* Left: Logo & Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5 w-full sm:w-auto">
                            {/* Logo Cloudinary / Fallback Avatar */}
                            <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-slate-900 p-1 sm:p-1.5 shadow-2xl border border-slate-700 flex-shrink-0">
                                {business.logo_url ? (
                                    <img
                                        src={business.logo_url}
                                        alt={business.name}
                                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl bg-slate-800"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-tr from-terracotta to-amber-500 text-white font-extrabold text-2xl sm:text-4xl flex items-center justify-center font-outfit shadow-inner">
                                        {business.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="absolute bottom-1 right-1 p-0.5 sm:p-1 bg-emerald-500 text-white rounded-full ring-2 ring-slate-900" title="Toko Aktif">
                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </span>
                            </div>

                            {/* Info Text dengan Kontras Teks Putih Terbaca Jelas */}
                            <div className="space-y-1 w-full sm:w-auto">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-[10px] sm:text-[11px] font-bold backdrop-blur-md">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        Mitra UMKM Resmi
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 font-medium">
                                        <MapPin className="w-3 h-3 text-terracotta" />
                                        {business.city_name || 'DIY & Jawa Tengah'}
                                    </span>
                                </div>

                                <h1 className="text-xl sm:text-3xl font-outfit font-black tracking-tight text-white drop-shadow-sm">
                                    {business.name}
                                </h1>

                                {business.description && (
                                    <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                        {business.description}
                                    </p>
                                )}

                                <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 pt-0.5 truncate max-w-full">
                                    <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                    <span className="truncate">{locationString}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right: Seller Direct Contact / Location Link */}
                        <div className="w-full sm:w-auto flex items-center gap-2 pt-1 sm:pt-0">
                            {business.google_maps_link && (
                                <a
                                    href={business.google_maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl sm:rounded-2xl text-xs font-semibold transition-all border border-slate-700"
                                    title="Lihat Lokasi di Google Maps"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
                    {/* Search Field */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Cari produk di ${business.name}...`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${selectedCategory === cat
                                        ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-xl font-outfit font-bold text-slate-900 flex items-center gap-2">
                        <span>Katalog Produk</span>
                        <span className="text-[11px] sm:text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                            {filteredProducts.length} Produk
                        </span>
                    </h2>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
                        <PackageX className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
                        <h3 className="text-sm sm:text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
                        <p className="text-xs text-slate-500">
                            Coba ubah kata kunci pencarian atau kategori filter Anda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {paginatedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    storeSlug={business.slug}
                                    storeName={business.name}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 pt-4 border-t border-slate-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={filteredProducts.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 350, behavior: 'smooth' });
                                    }}
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
