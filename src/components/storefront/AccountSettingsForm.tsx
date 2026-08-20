'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Save, Loader2, Sparkles, CheckCircle2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import BackButton from '@/components/ui/BackButton';
import { updateProfile } from '@/app/actions/profile';

export interface AccountSettingsFormProps {
    user: {
        id: string;
        email: string;
    };
    initialProfile?: {
        full_name?: string | null;
        phone_number?: string | null;
        avatar_url?: string | null;
        is_buyer?: boolean | null;
        is_seller?: boolean | null;
    } | null;
}

export default function AccountSettingsForm({ user, initialProfile }: AccountSettingsFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState<string>(initialProfile?.full_name || '');
    const [phone, setPhone] = useState<string>(initialProfile?.phone_number || '');
    const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile?.avatar_url || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

    const userInitial = (fullName || user.email || 'P').charAt(0).toUpperCase();

    // Trigger hidden file input click
    const handleAvatarClick = () => {
        if (isUploadingAvatar) return;
        fileInputRef.current?.click();
    };

    // Upload selected image file to Cloudinary & update Supabase profiles
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate image file type
        if (!file.type.startsWith('image/')) {
            toast.error('⚠️ Silakan pilih file gambar (JPG, PNG, WebP)');
            return;
        }

        // Validate image file size (Max 5 MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('⚠️ Ukuran gambar maksimal 5 MB');
            return;
        }

        setIsUploadingAvatar(true);
        const loadingToastId = toast.loading('Mengunggah foto profil ke Cloudinary...');

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'p2jfvcqi';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'lora_toko');

            // 1. Upload file to Cloudinary REST API
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Gagal mengunggah gambar ke server Cloudinary.');
            }

            const data = await response.json();
            const uploadedUrl = data.secure_url;

            // 2. Apply Cloudinary transformation (256x256 crop fill, focus on face)
            let transformedUrl = uploadedUrl;
            if (transformedUrl && transformedUrl.includes('/upload/')) {
                transformedUrl = transformedUrl.replace('/upload/', '/upload/w_256,h_256,c_fill,g_face/');
            }

            // 3. Update avatar_url in Supabase profiles table via updateProfile Server Action
            const result = await updateProfile({
                fullName: fullName.trim() || initialProfile?.full_name || 'Pengguna LORA',
                phone: phone.trim() || initialProfile?.phone_number || null,
                avatarUrl: transformedUrl,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            setAvatarUrl(transformedUrl);
            toast.success('📸 Foto profil berhasil diperbarui!', { id: loadingToastId });
            router.refresh();
        } catch (err: any) {
            console.error('Gagal mengunggah foto profil:', err);
            toast.error(err.message || '❌ Gagal memperbarui foto profil.', { id: loadingToastId });
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Save profile data (Full Name & Phone Number)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error('⚠️ Nama lengkap wajib diisi');
            return;
        }

        setIsSubmitting(true);
        const loadingToastId = toast.loading('Menyimpan perubahan profil...');

        try {
            const result = await updateProfile({
                fullName: fullName.trim(),
                phone: phone.trim() || null,
                avatarUrl: avatarUrl || null,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            toast.success('Informasi profil berhasil disimpan!', { id: loadingToastId });

            await Swal.fire({
                title: 'Berhasil Disimpan!',
                text: 'Informasi akun dan data diri Anda telah berhasil diperbarui.',
                icon: 'success',
                confirmButtonColor: '#D97706',
                confirmButtonText: 'Selesai',
                customClass: {
                    popup: 'rounded-3xl font-sans p-6',
                    confirmButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
                },
                willClose: () => {
                    if (typeof document !== 'undefined') {
                        document.body.style.overflow = 'auto';
                        document.body.style.paddingRight = '0px';
                        document.documentElement.style.overflow = 'auto';
                        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                        document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
                    }
                },
                didClose: () => {
                    if (typeof document !== 'undefined') {
                        document.body.style.overflow = 'auto';
                        document.body.style.paddingRight = '0px';
                        document.documentElement.style.overflow = 'auto';
                        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                        document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
                    }
                },
            });

            if (typeof document !== 'undefined') {
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '0px';
                document.documentElement.style.overflow = 'auto';
                document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
            }

            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (err: any) {
            console.error('Gagal memperbarui profil:', err);
            toast.error(err.message || 'Gagal menyimpan perubahan profil.', { id: loadingToastId });
            Swal.fire({
                title: 'Gagal Menyimpan',
                text: err.message || 'Gagal menyimpan perubahan profil.',
                icon: 'error',
                confirmButtonColor: '#E11D48',
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans p-6',
                    confirmButton: 'rounded-2xl font-bold px-5 py-2.5 text-xs',
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
            {/* Header Navigasi & Judul Halaman */}
            <div className="space-y-4">
                <BackButton label="Kembali" />

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-[10px] sm:text-[11px] font-bold">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Pengaturan Pengguna
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-slate-900">
                        Pengaturan Akun
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Kelola data diri, foto profil, dan kontak akun LORA Anda untuk kemudahan transaksi belanja.
                    </p>
                </div>
            </div>

            {/* Card Utama Profil Bergaya Minimalis LORA */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 w-full max-w-3xl mx-auto">
                {/* Bagian Avatar Pengguna dengan Interaksi Unggah Cloudinary */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-slate-100">
                    <div className="relative group">
                        {/* Hidden Input File Trigger */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />

                        {/* Lingkaran Avatar */}
                        <div
                            onClick={handleAvatarClick}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-100 shadow-md flex items-center justify-center overflow-hidden bg-gradient-to-tr from-terracotta to-amber-500 text-white font-extrabold text-3xl font-outfit flex-shrink-0 cursor-pointer transition-transform group-hover:scale-105"
                            title="Klik untuk mengubah foto profil"
                        >
                            {isUploadingAvatar ? (
                                <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white space-y-1 z-20">
                                    <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
                                    <span className="text-[10px] font-bold">Unggah...</span>
                                </div>
                            ) : avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={fullName || 'Avatar'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{userInitial}</span>
                            )}

                            {/* Camera Hover Overlay */}
                            {!isUploadingAvatar && (
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 z-10">
                                    <Camera className="w-6 h-6 text-amber-300" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Ubah Foto</span>
                                </div>
                            )}
                        </div>

                        {/* Tombol Floating Camera Edit Pelayang */}
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            disabled={isUploadingAvatar}
                            className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-slate-200 shadow-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer z-10"
                            title="Ubah Foto Profil"
                        >
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-outfit">
                            {fullName || 'Pengguna LORA'}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Formulir Data Diri (3 Input Utama) */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Input Nama Lengkap */}
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Masukkan nama lengkap Anda"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* 2. Input Email (Disabled / Tidak bisa diedit) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="email" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Alamat Email
                            </label>
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Lock className="w-3 h-3 text-amber-600" /> Terikat Autentikasi
                            </span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                disabled
                                value={user.email}
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 cursor-not-allowed font-mono"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Email akun tidak dapat diubah secara langsung karena terhubung ke sistem keamanan login Supabase.
                        </p>
                    </div>

                    {/* 3. Input Nomor WhatsApp / HP */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Nomor WhatsApp / HP
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Penting untuk konfirmasi pesanan dan koordinasi pengiriman oleh penjual UMKM.
                        </p>
                    </div>

                    {/* Tombol Aksi Simpan Perubahan */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploadingAvatar}
                            className={`w-full sm:w-auto py-3.5 px-8 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isSubmitting || isUploadingAvatar
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                    : 'bg-terracotta hover:bg-terracotta-hover text-white shadow-lg shadow-terracotta/20 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

