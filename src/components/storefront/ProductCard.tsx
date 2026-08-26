'use client';

import Link from 'next/link';
import { MapPin, ShoppingCart, Share2, Store, PackageX, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart, CartProduct } from '@/components/storefront/CartContext';
import { getProductImageWebp } from '@/lib/image-utils';

export interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        stock: number;
        min_stock?: number;
        image_url?: string | null;
        category?: string | null;
        description?: string | null;
    };
    storeSlug: string;
    storeName: string;
    locationName?: string;
}

export default function ProductCard({ product, storeSlug, storeName, locationName }: ProductCardProps) {
    const { addItem } = useCart();

    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.min_stock !== undefined && product.stock <= product.min_stock;
    const productDetailUrl = `/toko/${storeSlug}/${product.id}`;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) {
            toast.error('⚠️ Stok produk ini sudah habis');
            return;
        }

        const cartProd: CartProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            min_stock: product.min_stock,
            image_url: product.image_url,
            category: product.category,
            description: product.description,
        };

        await addItem(cartProd, storeSlug, storeName);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const fullUrl = typeof window !== 'undefined'
            ? `${window.location.origin}${productDetailUrl}`
            : productDetailUrl;

        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Beli ${product.name} dari ${storeName} di LORA Storefront!`,
                url: fullUrl,
            }).catch(() => { });
        } else {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(fullUrl);
                toast.success('📋 Tautan produk telah disalin!');
            }
        }
    };

    return (
        <div className="h-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            {/* Card Content wrapped in Link to Product Detail */}
            <Link href={productDetailUrl} className="flex-1 flex flex-col justify-start">
                {/* Product Image Thumbnail */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 block flex-shrink-0">
                    {product.image_url ? (
                        <img
                            src={getProductImageWebp(product.image_url, 400)}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                isOutOfStock ? 'opacity-60 grayscale-[50%]' : ''
                            }`}
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 ${
                            isOutOfStock ? 'opacity-60 grayscale-[50%]' : ''
                        }`}>
                            <Store className="w-10 h-10 stroke-1" />
                        </div>
                    )}

                    {/* Top Overlay Badges Container */}
                    <div className="absolute top-0 left-0 right-0 p-2 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
                        {/* Location / Category Badge */}
                        {locationName ? (
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl flex items-center gap-1 min-w-0 max-w-[65%] truncate">
                                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-terracotta flex-shrink-0" />
                                <span className="truncate">{locationName}</span>
                            </span>
                        ) : product.category ? (
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl min-w-0 max-w-[65%] truncate">
                                <span className="truncate">{product.category}</span>
                            </span>
                        ) : <div />}

                        {/* Stock Badges */}
                        {isOutOfStock ? (
                            <span className="flex-shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl flex items-center gap-1 shadow-md">
                                <PackageX className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span>Habis</span>
                            </span>
                        ) : isLowStock ? (
                            <span className="flex-shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl flex items-center gap-1 shadow-md animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span>Sisa {product.stock}</span>
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Product Info Body with Consistent Title Height */}
                <div className="p-3 sm:p-4 pb-2 space-y-1 flex-1 flex flex-col justify-start">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-terracotta uppercase tracking-wider transition-colors inline-block truncate max-w-full">
                        {storeName}
                    </span>

                    {/* Judul dengan tinggi minimum tetap 2 baris (min-h) agar seluruh kartu simetris */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.75rem] flex items-start group-hover:text-terracotta transition-colors">
                        {product.name}
                    </h3>
                </div>
            </Link>

            {/* Bottom Footer Area: Price & Action Buttons in Fixed Baseline */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-auto bg-white">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-base font-outfit font-extrabold text-slate-900 truncate">
                        Rp {product.price.toLocaleString('id-ID')}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Icon Button: Tambah ke Keranjang */}
                    <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        title={isOutOfStock ? "Stok Habis" : "+ Keranjang"}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-terracotta hover:bg-terracotta-hover text-white shadow-md hover:scale-105 active:scale-95'
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>

                    {/* Icon Button: Share */}
                    <button
                        type="button"
                        onClick={handleShare}
                        title="Bagikan Produk"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-white border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
