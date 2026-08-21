'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    Search,
    X,
    RotateCcw,
    MapPin,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    LayoutGrid,
    Shirt,
    Utensils,
    Palette,
    ShoppingBag,
    Sparkles,
    Coffee,
    Sprout,
    LucideIcon
} from 'lucide-react';

interface KatalogFilterProps {
    categories?: string[];
    availableCities?: string[];
}

// Pemetaan Ikon Kategori Pill Chips
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    'Semua Produk': LayoutGrid,
    'Semua': LayoutGrid,
    'Batik & Kain': Shirt,
    'Kuliner & Oleh-oleh': Utensils,
    'Kerajinan Tangan': Palette,
    'Fashion & Aksesoris': ShoppingBag,
    'Kopi & Olahan': Coffee,
    'Agribisnis': Sprout,
};

export default function KatalogFilter({ categories = [], availableCities = [] }: KatalogFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Reaksi awal state dari URL Query Parameters
    const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || 'Semua Produk';
    const selectedCity = searchParams.get('city_name') || searchParams.get('city') || '';
    const selectedRegion = searchParams.get('region') || '';

    const [searchInputValue, setSearchInputValue] = useState(initialQuery);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Carousel Ref & Scroll Tracking
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollable = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 10);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        return () => window.removeEventListener('resize', checkScrollable);
    }, []);

    const handleScroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScrollable, 300);
        }
    };

    // 1 & 2. State & Fetch Kategori Dinamis dari Supabase (Tabel product_categories)
    const [dynamicCategories, setDynamicCategories] = useState<string[]>(() => {
        if (categories && categories.length > 0) {
            return categories.includes('Semua Produk') ? categories : ['Semua Produk', ...categories];
        }
        return ['Semua Produk'];
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                // Fetch data dari Supabase tabel product_categories ambil kolom name
                const { data, error } = await supabase
                    .from('product_categories')
                    .select('name');

                if (!error && data && data.length > 0) {
                    // Ekstrak nama kategori menjadi nilai unik (distinct)
                    const names = data
                        .map((item: { name?: string | null }) => item.name?.trim())
                        .filter((name): name is string => Boolean(name && name.length > 0));

                    const uniqueCategories = Array.from(new Set(names));

                    // Set state dengan 'Semua Produk' di urutan paling awal
                    setDynamicCategories(['Semua Produk', ...uniqueCategories]);
                }
            } catch (err) {
                console.error('Gagal memuat kategori dari Supabase:', err);
            }
        }

        fetchCategories();
    }, []);

    // Label lokasi aktif yang ditampilkan pada tombol filter
    const currentDisplayLabel = useMemo(() => {
        if (selectedCity) return selectedCity;
        if (selectedRegion && selectedRegion !== 'Semua Wilayah') return selectedRegion;
        return 'Semua Wilayah';
    }, [selectedCity, selectedRegion]);

    const isLocationSelected = Boolean(
        (selectedCity && selectedCity !== 'Semua Wilayah') ||
        (selectedRegion && selectedRegion !== 'Semua Wilayah')
    );

    // Sinkronkan state input pencarian saat URL berubah
    useEffect(() => {
        setSearchInputValue(initialQuery);
    }, [initialQuery]);

    // Live Search dengan Debounce (Jeda 350ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParamQuery = searchParams.get('q') || searchParams.get('search') || '';
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

    // Handler Pilih Lokasi Dinamis dari Database Supabase
    const handleSelectLocation = (cityName: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (cityName && cityName !== 'Semua Wilayah' && cityName !== 'Semua') {
            params.set('city_name', cityName);
            params.set('region', cityName);
            params.delete('subdistrict_name');
        } else {
            params.delete('city_name');
            params.delete('subdistrict_name');
            params.delete('region');
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
        setIsDropdownOpen(false);
    };

    // Handler Reset Seluruh Filter
    const handleResetAll = () => {
        setSearchInputValue('');
        router.replace(pathname, { scroll: false });
        setIsDropdownOpen(false);
    };

    const isFiltered = Boolean(
        initialQuery ||
        (currentCategory && currentCategory !== 'Semua Produk') ||
        isLocationSelected
    );

    return (
        <div suppressHydrationWarning className="space-y-6">
            {/* Integrated Search Bar & Dynamic Location Filter Dropdown */}
            <div suppressHydrationWarning className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">

                {/* Search Bar Input Utama */}
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
                        className="w-full pl-11 pr-14 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all shadow-xs font-medium"
                    />
                    {searchInputValue && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Hapus Pencarian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </form>

                {/* Container Filter Lokasi & Tombol Reset Sejajar (Kompak di Mobile) */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Tombol & List Dropdown Pilihan Kota Dinamis dari Database */}
                    <div className="relative flex-1 sm:w-52 lg:w-60 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(prev => !prev)}
                            className={`w-full px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-xs border ${
                                isLocationSelected
                                    ? 'bg-orange-50/90 border-terracotta text-terracotta font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <MapPin className={`w-4 h-4 flex-shrink-0 ${
                                    isLocationSelected ? 'text-terracotta' : 'text-slate-500'
                                }`} />
                                <span className="truncate">{currentDisplayLabel}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                                isDropdownOpen ? 'rotate-180 text-terracotta' : ''
                            }`} />
                        </button>

                        {/* Popover List Dropdown Kota Dinamis Supabase */}
                        {isDropdownOpen && (
                            <>
                                {/* Backdrop overlay untuk menutup dropdown saat klik di luar */}
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsDropdownOpen(false)}
                                />

                                <div className="absolute right-0 mt-2 w-full sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto hide-scrollbar">

                                    {/* Opsi Utama: Semua Wilayah */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectLocation('Semua Wilayah')}
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-left ${
                                            !isLocationSelected ? 'bg-amber-50 text-terracotta font-bold' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>Semua Wilayah</span>
                                        {!isLocationSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                                    </button>

                                    {/* Label Header jika ada Kota Toko Terdaftar */}
                                    {availableCities.length > 0 && (
                                        <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Kota Toko Terdaftar ({availableCities.length})
                                        </div>
                                    )}

                                    {/* Render Daftar Kota Dinamis dari Supabase */}
                                    {availableCities.map((cityName) => {
                                        const isSelected =
                                            selectedCity.toLowerCase() === cityName.toLowerCase() ||
                                            selectedRegion.toLowerCase() === cityName.toLowerCase();

                                        return (
                                            <button
                                                key={cityName}
                                                type="button"
                                                onClick={() => handleSelectLocation(cityName)}
                                                className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer text-left ${
                                                    isSelected ? 'bg-amber-50 text-terracotta font-bold' : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{cityName}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />}
                                            </button>
                                        );
                                    })}

                                    {/* Fallback jika belum ada toko terdaftar */}
                                    {availableCities.length === 0 && (
                                        <div className="px-3 py-3 text-center text-xs text-slate-400 font-medium">
                                            Belum ada data kota toko terdaftar.
                                        </div>
                                    )}

                                </div>
                            </>
                        )}
                    </div>

                    {/* Tombol Reset Filter Kompak */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="flex-shrink-0 p-3.5 sm:px-4 sm:py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Reset Seluruh Filter"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Container Single-Row Horizontal Carousel Kategori dengan Tombol Melayang & Edge Fade */}
            <div className="relative group/carousel">
                {/* Tombol Navigasi Kiri */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-6 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent">
                        <button
                            type="button"
                            onClick={() => handleScroll('left')}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-md text-slate-700 hover:text-terracotta hover:border-terracotta hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                            aria-label="Scroll Kategori ke Kiri"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Slider List Kategori */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollable}
                    className="flex overflow-x-auto whitespace-nowrap gap-2 sm:gap-2.5 py-1 px-1 scroll-smooth hide-scrollbar snap-x"
                >
                    {dynamicCategories.map((cat) => {
                        const isActive =
                            cat === currentCategory ||
                            (cat === 'Semua Produk' && (!currentCategory || currentCategory === 'Semua Produk'));

                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer snap-start ${
                                    isActive
                                        ? 'bg-terracotta text-white border border-terracotta shadow-md shadow-terracotta/25 font-bold scale-102'
                                        : 'border border-slate-200/90 bg-white text-slate-700 hover:border-terracotta hover:text-terracotta hover:bg-orange-50/70 shadow-2xs'
                                }`}
                            >
                                <span>{cat}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tombol Navigasi Kanan */}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-6 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent">
                        <button
                            type="button"
                            onClick={() => handleScroll('right')}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-md text-slate-700 hover:text-terracotta hover:border-terracotta hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                            aria-label="Scroll Kategori ke Kanan"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
