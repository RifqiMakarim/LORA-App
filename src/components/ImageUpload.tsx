'use client';

import React, { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Camera, Check, CheckCircle2, Loader2, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { optimizeCloudinaryUrl, MediaType } from '@/lib/image-utils';

export interface ImageUploadProps {
    value?: string;
    onConfirm: (url: string) => void;
    onRemove?: () => void;
    uploadPreset?: string;
    label?: string;
    helperText?: string;
    aspectRatio?: 'square' | 'banner';
    mediaType?: MediaType;
}

export default function ImageUpload({
    value = '',
    onConfirm,
    onRemove,
    uploadPreset = 'lora_toko',
    label = 'Foto',
    helperText = 'Format JPG, PNG, atau WEBP (Maksimal 5MB)',
    aspectRatio = 'square',
    mediaType = 'product',
}: ImageUploadProps) {
    const [confirmedUrl, setConfirmedUrl] = useState<string>(value);
    const [pendingUrl, setPendingUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(!!value);

    useEffect(() => {
        if (value) {
            setConfirmedUrl(value);
            setIsConfirmed(true);
        } else {
            setConfirmedUrl('');
            setIsConfirmed(false);
        }
    }, [value]);

    const isBanner = aspectRatio === 'banner';

    // Helper untuk mereset scroll lock yang disuntikkan oleh widget pihak ketiga (seperti Cloudinary)
    const forceUnlockScroll = () => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.style.overflow = '';
        }
    };

    // Pastikan saat komponen ImageUpload dilepas (unmount), scroll body dipulihkan
    useEffect(() => {
        return () => {
            forceUnlockScroll();
        };
    }, []);

    // Handle saat upload selesai dari CldUploadWidget atau input file
    const handleUploadSuccess = (url: string) => {
        setIsUploading(false);
        const optimizedUrl = optimizeCloudinaryUrl(url, mediaType);
        setPendingUrl(optimizedUrl);
        setIsSuccess(true);
        setIsConfirmed(false);
        forceUnlockScroll();
        // Beri delay singkat untuk menangkap style yang disuntikkan secara asinkron saat widget menutup
        setTimeout(forceUnlockScroll, 100);
        setTimeout(forceUnlockScroll, 300);
    };

    // Handle saat pengguna mengeklik tombol 'Selesai' / 'Gunakan Foto Ini'
    const handleFinalConfirm = () => {
        if (!pendingUrl) return;
        setConfirmedUrl(pendingUrl);
        setIsConfirmed(true);
        setIsSuccess(false);
        onConfirm(pendingUrl);
        forceUnlockScroll();
    };

    // Handle Ganti / Unggah Ulang
    const handleReset = () => {
        setPendingUrl('');
        setIsSuccess(false);
        setIsConfirmed(false);
        if (onRemove && !confirmedUrl) {
            onRemove();
        }
        forceUnlockScroll();
    };

    // Handle Hapus Foto sepenuhnya
    const handleRemoveAll = () => {
        setConfirmedUrl('');
        setPendingUrl('');
        setIsSuccess(false);
        setIsConfirmed(false);
        if (onRemove) {
            onRemove();
        }
        forceUnlockScroll();
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* 1. STATE TERKONFIRMASI (Foto Sudah Digunakan & Aktif) */}
                {isConfirmed && confirmedUrl ? (
                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 ${
                                    isBanner ? 'w-24 h-14' : 'w-14 h-14'
                                }`}
                            >
                                <img
                                    src={confirmedUrl}
                                    alt="Foto Terkonfirmasi"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto Aktif Digunakan
                                </span>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {confirmedUrl}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                            <CldUploadWidget
                                uploadPreset={uploadPreset}
                                onSuccess={(result) => {
                                    if (typeof result.info !== 'string' && result.info?.secure_url) {
                                        handleUploadSuccess(result.info.secure_url);
                                    }
                                }}
                                onClose={() => forceUnlockScroll()}
                                onError={() => {
                                    setIsUploading(false);
                                    forceUnlockScroll();
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 text-terracotta" />
                                        <span>Ganti Foto</span>
                                    </button>
                                )}
                            </CldUploadWidget>

                            <button
                                type="button"
                                onClick={handleRemoveAll}
                                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                ) : isSuccess && pendingUrl ? (
                    /* 2. STATE PRATINJAU & KONFIRMASI (Upload Selesai, Menunggu Klik 'Gunakan Foto Ini') */
                    <div className="p-4 bg-amber-50/80 border-2 border-amber-400/80 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                                <span>Unggah Selesai! Pratinjau Foto:</span>
                            </span>
                            <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                                Belum Disimpan
                            </span>
                        </div>

                        {/* Pratinjau Foto */}
                        <div
                            className={`relative mx-auto rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-900 shadow-md ${
                                isBanner ? 'w-full h-36' : 'w-32 h-32'
                            }`}
                        >
                            <img
                                src={pendingUrl}
                                alt="Pratinjau Foto Baru"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Tombol Konfirmasi 'Gunakan Foto Ini' / 'Selesai' */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-1">
                            <CldUploadWidget
                                uploadPreset={uploadPreset}
                                onSuccess={(result) => {
                                    if (typeof result.info !== 'string' && result.info?.secure_url) {
                                        handleUploadSuccess(result.info.secure_url);
                                    }
                                }}
                                onClose={() => forceUnlockScroll()}
                                onError={() => {
                                    setIsUploading(false);
                                    forceUnlockScroll();
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Pilih Foto Lain
                                    </button>
                                )}
                            </CldUploadWidget>

                            <button
                                type="button"
                                onClick={handleFinalConfirm}
                                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>Gunakan Foto Ini</span>
                            </button>
                        </div>
                    </div>
                ) : isUploading ? (
                    /* 3. STATE SEDANG MENGUNGGAH (Loading Progress) */
                    <div className="p-6 bg-slate-50 border-2 border-dashed border-terracotta/40 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center">
                        <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
                        <p className="text-xs font-bold text-slate-800">Sedang Mengunggah Foto...</p>
                        <p className="text-[11px] text-slate-400">Mohon tunggu sebentar hingga selesai</p>
                    </div>
                ) : (
                    /* 4. STATE AWAL / DROPZONE UPLOAD */
                    <CldUploadWidget
                        uploadPreset={uploadPreset}
                        onSuccess={(result) => {
                            if (typeof result.info !== 'string' && result.info?.secure_url) {
                                handleUploadSuccess(result.info.secure_url);
                            }
                        }}
                        onClose={() => forceUnlockScroll()}
                        onError={() => {
                            setIsUploading(false);
                            forceUnlockScroll();
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="w-full p-5 bg-white border-2 border-dashed border-slate-300 hover:border-terracotta rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all hover:bg-amber-50/20 group cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-amber-50 group-hover:bg-terracotta/10 text-amber-600 group-hover:text-terracotta rounded-full flex items-center justify-center transition-colors">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        Klik untuk Unggah {label}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
                                </div>
                            </button>
                        )}
                    </CldUploadWidget>
                )}
            </div>
        </div>
    );
}
