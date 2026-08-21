'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import {
    ShoppingCart,
    MapPin,
    Store,
    AlertTriangle,
    PackageX,
    Share2,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/components/storefront/CartContext';

export interface ProductDetailProps {
    product: {
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
    };
    business: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        city_name?: string | null;
        province_name?: string | null;
        contact_number?: string | null;
        logo_url?: string | null;
        banner_url?: string | null;
    };
}

export default function ProductDetailView({ product, business }: ProductDetailProps) {
    const { addItem } = useCart();

    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= product.min_stock;

    const handleAddToCart = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isOutOfStock) {
            toast.error('⚠️ Stok produk ini sudah habis');
            return;
        }
        await addItem(
            {
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                min_stock: product.min_stock,
                image_url: product.image_url,
                category: product.category,
                description: product.description,
            },
            business.slug,
            business.name
        );
    };

    const formatWhatsAppNumber = (phoneStr?: string | null): string => {
        if (!phoneStr) return '6281234567890';
        let clean = phoneStr.replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
        else if (clean.startsWith('8')) clean = '62' + clean;
        return clean;
    };

    const locationName = [business.city_name, business.province_name].filter(Boolean).join(', ') || 'DIY & Jawa Tengah';

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <BackButton label="Kembali" />

                <button
                    type="button"
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: product.name,
                                text: `Beli ${product.name} dari ${business.name} di LORA Storefront!`,
                                url: window.location.href,
                            }).catch(() => { });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('📋 Tautan produk telah disalin!');
                        }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5 text-terracotta" />
                    <span>Bagikan Produk</span>
                </button>
            </div>

            {/* Split Layout Product Detail */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Image Gallery (5 Cols) */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Store className="w-16 h-16 stroke-1" />
                                </div>
                            )}

                            {/* Stock Badge */}
                            {isOutOfStock ? (
                                <span className="absolute top-3 right-3 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md">
                                    <PackageX className="w-3.5 h-3.5" /> Stok Habis
                                </span>
                            ) : isLowStock ? (
                                <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Stok Terbatas ({product.stock})
                                </span>
                            ) : (
                                <span className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md">
                                    Stok Tersedia ({product.stock})
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Product Body Info (7 Cols) */}
                    <div className="md:col-span-7 space-y-5">
                        {/* Store Reference Info */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {business.logo_url ? (
                                    <img
                                        src={business.logo_url}
                                        alt={business.name}
                                        className="w-9 h-9 rounded-xl object-cover border border-slate-300"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-terracotta to-amber-500 text-white font-bold text-sm flex items-center justify-center">
                                        {business.name.charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <Link
                                        href={`/toko/${business.slug}`}
                                        className="text-xs font-bold text-slate-900 hover:text-terracotta transition-colors truncate block"
                                    >
                                        {business.name}
                                    </Link>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-terracotta" />
                                        <span>{locationName}</span>
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/toko/${business.slug}`}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                            >
                                Kunjungi Toko
                            </Link>
                        </div>

                        {/* Title & Category */}
                        <div className="space-y-2">
                            {product.category && (
                                <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-bold">
                                    <Sparkles className="w-3 h-3 text-terracotta" />
                                    {product.category}
                                </span>
                            )}
                            <h1 className="text-xl sm:text-3xl font-outfit font-black text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                    Harga Resmi UMKM
                                </p>
                                <p className="text-2xl sm:text-3xl font-outfit font-black text-amber-400">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Jaminan Kualitas UMKM</span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="space-y-1.5 pt-1">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Deskripsi Produk:
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={handleAddToCart}
                                className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${isOutOfStock
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        : 'bg-terracotta hover:bg-terracotta-hover text-white shadow-lg shadow-terracotta/25 hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                            >
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{isOutOfStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
