'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const BANNERS = [
    {
        id: 1,
        image: '/images/carousel1.jpeg',
        title: 'Promo Spesial Produk UMKM Regional',
        subtitle: 'Dapatkan produk autentik khas DIY & Jawa Tengah langsung dari pengrajin lokal.',
        tag: '✨ Promo Pilihan',
    },
    {
        id: 2,
        image: '/images/carousel2.jpeg',
        title: 'Batik & Kerajinan Seni Autentik',
        subtitle: 'Koleksi batik tulis, ukiran kayu, dan produk fashion buatan tangan terlengkap.',
        tag: '🎨 Hasil Karya Lokal',
    },
    {
        id: 3,
        image: '/images/carousel3.jpeg',
        title: 'Kuliner & Oleh-oleh Khas Daerah',
        subtitle: 'Nikmati cita rasa bakpia, kripik, dan santapan tradisional dalam kemasan siap kirim.',
        tag: '🍲 Kuliner Nusantara',
    },
];

export default function KatalogBannerSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 25 },
        [Autoplay({ delay: 4500, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative group w-full max-w-7xl mx-auto overflow-hidden">
            {/* Embla Carousel Viewport Container */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 bg-slate-900" ref={emblaRef}>
                <div className="flex">
                    {BANNERS.map((banner) => (
                        <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 aspect-[21/9] lg:aspect-[3/1] h-[180px] sm:h-[240px] lg:h-[300px]">
                            {/* Gambar Banner */}
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                                priority={banner.id === 1}
                            />

                            {/* Dark Gradient Overlay for Typography Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent rounded-2xl sm:rounded-3xl" />

                            {/* Banner Text Overlay */}
                            <div className="absolute bottom-3 sm:bottom-6 left-3.5 sm:left-8 right-3.5 sm:right-8 z-10 space-y-1 text-white">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    {banner.tag}
                                </span>
                                <h2 className="text-xs sm:text-2xl lg:text-3xl font-outfit font-extrabold tracking-tight drop-shadow-md leading-tight">
                                    {banner.title}
                                </h2>
                                <p className="text-slate-200 text-xs sm:text-sm max-w-xl line-clamp-1 hidden sm:block font-medium">
                                    {banner.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tombol Panah Navigasi Kiri & Kanan (Muncul saat hover di Desktop) */}
            <button
                onClick={scrollPrev}
                type="button"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer hover:scale-105"
                aria-label="Slide Sebelumnya"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
                onClick={scrollNext}
                type="button"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer hover:scale-105"
                aria-label="Slide Selanjutnya"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Pagination Dots (Titik-Titik Halaman - Disembunyikan di Mobile, Muncul di Screen Medium ke Atas) */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 z-20 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {scrollSnaps.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => scrollTo(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === selectedIndex
                                ? 'w-6 sm:w-7 bg-amber-500 shadow-xs'
                                : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Ke slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
