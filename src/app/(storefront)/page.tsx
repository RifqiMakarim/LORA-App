import Link from 'next/link';
import { ShoppingCart, MapPin, Star, Filter } from 'lucide-react';

// Data Dummy Produk Katalog LORA (Untuk Pengujian Layout Storefront)
const dummyProducts = [
    {
        id: 'prod-1',
        name: 'Batik Tulis Motif Parang Gurdo Premium',
        storeName: 'Batik Keraton Solo',
        location: 'Surakarta, Jawa Tengah',
        price: 350000,
        rating: 4.9,
        soldCount: 124,
        category: 'Batik',
        imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 'prod-2',
        name: 'Bakpia Pathok Asli Khas Jogja Rasa Cokelat',
        storeName: 'Bakpia Pathok 25',
        location: 'Yogyakarta, DI Yogyakarta',
        price: 45000,
        rating: 4.8,
        soldCount: 512,
        category: 'Kuliner',
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 'prod-3',
        name: 'Kerajinan Ukir Kayu Jati Asli Jepara',
        storeName: 'Ukiran Jepara Utama',
        location: 'Jepara, Jawa Tengah',
        price: 750000,
        rating: 5.0,
        soldCount: 48,
        category: 'Kerajinan',
        imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 'prod-4',
        name: 'Gudeg Kaleng Asli Wijilan Yogyakarta',
        storeName: 'Gudeg Bu Tjitro 1925',
        location: 'Yogyakarta, DI Yogyakarta',
        price: 55000,
        rating: 4.9,
        soldCount: 340,
        category: 'Kuliner',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    },
];

const categories = ['Semua Produk', 'Batik & Kain', 'Kuliner & Oleh-oleh', 'Kerajinan Tangan', 'Fashion & Aksesoris'];

export default function StorefrontHomePage() {
    return (
        <div className="space-y-8">
            {/* Header Hero Banner Katalog */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-10 shadow-xl">
                <div className="relative z-10 max-w-xl space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                        ✨ Regional UMKM Storefront
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight leading-tight">
                        Katalog Produk LORA
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Jelajahi produk batik tulis, oleh-oleh kuliner khas, dan kerajinan seni dari pengrajin lokal Daerah Istimewa Yogyakarta & Jawa Tengah.
                    </p>
                </div>
            </div>

            {/* Category Filter Horizontal Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 pr-2">
                    <Filter className="w-3.5 h-3.5" /> Kategori:
                </span>
                {categories.map((cat, idx) => (
                    <button
                        key={cat}
                        type="button"
                        className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            idx === 0
                                ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-outfit font-bold text-slate-900">
                        Rekomendasi Produk Unggulan
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">Menampilkan {dummyProducts.length} Produk</span>
                </div>

                {/* Grid Kartu Produk (Shopee Style Grid: 2 kolom mobile, 4 kolom desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {dummyProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                        >
                            {/* Product Image Thumbnail */}
                            <div className="relative aspect-square overflow-hidden bg-slate-100">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-xl flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-terracotta" />
                                    {product.location.split(',')[0]}
                                </span>
                            </div>

                            {/* Product Info Body */}
                            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {product.storeName}
                                    </p>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-terracotta transition-colors">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="pt-2 space-y-2">
                                    {/* Rating & Sold count */}
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <div className="flex items-center text-amber-500 font-bold">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                                            <span>{product.rating}</span>
                                        </div>
                                        <span>•</span>
                                        <span>Terjual {product.soldCount}</span>
                                    </div>

                                    {/* Price and Add to Cart Action */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        <p className="text-sm sm:text-base font-outfit font-extrabold text-slate-900">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </p>
                                        <button
                                            type="button"
                                            className="p-2 bg-terracotta/10 hover:bg-terracotta text-terracotta hover:text-white rounded-xl transition-colors cursor-pointer"
                                            title="Tambah ke Keranjang"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
