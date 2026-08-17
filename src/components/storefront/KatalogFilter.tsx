'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

interface KatalogFilterProps {
    categories: string[];
}

export default function KatalogFilter({ categories }: KatalogFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Reaksi awal state dari URL Query Parameters (?q=... atau ?search=... dan ?category=...)
    const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || 'Semua Produk';

    const [searchInputValue, setSearchInputValue] = useState(initialQuery);

    // Sinkronkan state input saat searchParams eksternal berubah (misal dari tombol reset)
    useEffect(() => {
        setSearchInputValue(initialQuery);
    }, [initialQuery]);

    // Live Search dengan Debounce (Jeda 350ms) & Update URL tanpa kedip ({ scroll: false })
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParamQuery = searchParams.get('q') || searchParams.get('search') || '';
            // Hanya update URL jika nilai teks input berbeda dari parameter URL saat ini
            if (searchInputValue.trim() !== currentParamQuery.trim()) {
                const params = new URLSearchParams(searchParams.toString());

                if (searchInputValue.trim()) {
                    params.set('q', searchInputValue.trim());
                } else {
                    params.delete('q');
                    params.delete('search');
                }

                const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
                router.replace(newUrl, { scroll: false });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInputValue, pathname, router, searchParams]);

    // Handler Hapus Teks Pencarian
    const handleClearSearch = () => {
        setSearchInputValue('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        params.delete('search');
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
    };

    // Handler Klik Kategori
    const handleCategoryClick = (categoryName: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (categoryName && categoryName !== 'Semua Produk' && categoryName !== 'Semua') {
            params.set('category', categoryName);
        } else {
            params.delete('category');
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
    };

    // Handler Reset Seluruh Filter
    const handleResetAll = () => {
        setSearchInputValue('');
        router.replace(pathname, { scroll: false });
    };

    const isFiltered = Boolean(initialQuery || (currentCategory && currentCategory !== 'Semua Produk'));

    return (
        <div suppressHydrationWarning className="space-y-4">
            {/* Search Input Bar & Reset Action */}
            <div suppressHydrationWarning className="flex flex-col sm:flex-row items-center gap-3">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="relative flex-1 w-full"
                >
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        placeholder="Cari batik, bakpia, kerajinan kayu, aksesoris..."
                        className="w-full pl-11 pr-14 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all shadow-sm font-medium"
                    />
                    {searchInputValue && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Hapus Pencarian"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </form>

                {isFiltered && (
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset Filter</span>
                    </button>
                )}
            </div>

            {/* Category Filter Horizontal Scrollable Bar */}
            <div suppressHydrationWarning className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 pr-1 flex-shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Kategori:
                </span>
                {categories.map((cat) => {
                    const isActive =
                        cat === currentCategory ||
                        (cat === 'Semua Produk' && (!currentCategory || currentCategory === 'Semua Produk'));

                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                                isActive
                                    ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
