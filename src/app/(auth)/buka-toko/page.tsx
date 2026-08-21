'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import Swal from 'sweetalert2';
import ImageUpload from '@/components/ImageUpload';
import Combobox from '@/components/ui/Combobox';
import { registerBusiness } from '@/app/actions/business';
import {
    Store,
    AlertCircle,
    QrCode,
    Check,
    Trash2,
    UploadCloud,
    Building2,
    ArrowLeft
} from 'lucide-react';

// Opsi Bank Populer di Indonesia
const BANK_OPTIONS = [
    'BCA',
    'Mandiri',
    'BNI',
    'BRI',
    'BSI',
    'CIMB Niaga',
    'BJB',
    'Lainnya',
];

// Tipe Data Wilayah Indonesia (API EMSIFA)
type Province = { id: string; name: string };
type Regency = { id: string; province_id: string; name: string };
type District = { id: string; regency_id: string; name: string };
type Village = { id: string; district_id: string; name: string };

export default function BukaTokoPage() {
    const [state, formAction, isPending] = useActionState(registerBusiness, null);

    // State Local untuk Cloudinary Image Upload
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [bannerUrl, setBannerUrl] = useState<string>('');

    // State Local untuk Metode Pembayaran (QRIS & Rekening Bank)
    const [qrisFile, setQrisFile] = useState<File | null>(null);
    const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string>('');
    const [qrisImageUrl, setQrisImageUrl] = useState<string>('');
    const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
    const [bankName, setBankName] = useState<string>('');
    const [bankAccountNumber, setBankAccountNumber] = useState<string>('');

    // 1. State Daftar Wilayah (Array)
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    // 2. State Wilayah Terpilih (Object ID & Name)
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedCity, setSelectedCity] = useState<Regency | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

    // Loading State untuk UX Dropdown
    const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);
    const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
    const [loadingVillages, setLoadingVillages] = useState<boolean>(false);

    // 3. useEffect: Fetch Daftar Provinsi Saat Komponen Pertama Kali Dimuat
    useEffect(() => {
        async function fetchProvinces() {
            setLoadingProvinces(true);
            try {
                const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
                if (res.ok) {
                    const data: Province[] = await res.json();
                    setProvinces(data);
                }
            } catch (err) {
                console.error('Gagal memuat data provinsi:', err);
            } finally {
                setLoadingProvinces(false);
            }
        }
        fetchProvinces();
    }, []);

    // 4. useEffect: Fetch Daftar Kota Saat Dropdown Provinsi Berubah
    useEffect(() => {
        setCities([]);
        setDistricts([]);
        setVillages([]);
        setSelectedCity(null);
        setSelectedDistrict(null);
        setSelectedVillage(null);

        const provinceId = selectedProvince?.id;
        if (!provinceId) return;

        async function fetchCities() {
            setLoadingCities(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
                if (res.ok) {
                    const data: Regency[] = await res.json();
                    setCities(data);
                }
            } catch (err) {
                console.error('Gagal memuat data kota/kabupaten:', err);
            } finally {
                setLoadingCities(false);
            }
        }
        fetchCities();
    }, [selectedProvince?.id]);

    // 5. useEffect: Fetch Daftar Kecamatan Saat Dropdown Kota Berubah
    useEffect(() => {
        setDistricts([]);
        setVillages([]);
        setSelectedDistrict(null);
        setSelectedVillage(null);

        const cityId = selectedCity?.id;
        if (!cityId) return;

        async function fetchDistricts() {
            setLoadingDistricts(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
                if (res.ok) {
                    const data: District[] = await res.json();
                    setDistricts(data);
                }
            } catch (err) {
                console.error('Gagal memuat data kecamatan:', err);
            } finally {
                setLoadingDistricts(false);
            }
        }
        fetchDistricts();
    }, [selectedCity?.id]);

    // 6. useEffect: Fetch Daftar Kelurahan Saat Dropdown Kecamatan Berubah
    useEffect(() => {
        setVillages([]);
        setSelectedVillage(null);

        const districtId = selectedDistrict?.id;
        if (!districtId) return;

        async function fetchVillages() {
            setLoadingVillages(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
                if (res.ok) {
                    const data: Village[] = await res.json();
                    setVillages(data);
                }
            } catch (err) {
                console.error('Gagal memuat data kelurahan:', err);
            } finally {
                setLoadingVillages(false);
            }
        }
        fetchVillages();
    }, [selectedDistrict?.id]);

    // Handler Perubahan Selection Dropdown
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provId = e.target.value;
        const found = provinces.find((p) => p.id === provId) || null;
        setSelectedProvince(found);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        const found = cities.find((c) => c.id === cityId) || null;
        setSelectedCity(found);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const distId = e.target.value;
        const found = districts.find((d) => d.id === distId) || null;
        setSelectedDistrict(found);
    };

    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const villId = e.target.value;
        const found = villages.find((v) => v.id === villId) || null;
        setSelectedVillage(found);
    };

    // Handler Unggah File QRIS ke Cloudinary
    const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                title: 'Format File Salah',
                text: 'Silakan unggah file gambar (JPG, PNG, atau WebP)',
                icon: 'warning',
                confirmButtonColor: '#D97706',
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                },
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                title: 'Ukuran Gambar Terlalu Besar',
                text: 'Ukuran file gambar QRIS maksimal 5 MB',
                icon: 'warning',
                confirmButtonColor: '#D97706',
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                },
            });
            return;
        }

        setQrisFile(file);
        const previewUrl = URL.createObjectURL(file);
        setQrisPreviewUrl(previewUrl);

        // Upload otomatis ke Cloudinary
        setIsUploadingQris(true);
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'p2jfvcqi';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'lora_toko');

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Gagal mengunggah gambar QRIS ke Cloudinary.');
            }

            const data = await response.json();
            setQrisImageUrl(data.secure_url);
        } catch (err: any) {
            console.error('Gagal mengunggah QRIS:', err);
            Swal.fire({
                title: 'Gagal Unggah QRIS',
                text: err.message || 'Terjadi kesalahan saat mengunggah gambar QRIS.',
                icon: 'error',
                confirmButtonColor: '#D97706',
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                },
            });
        } finally {
            setIsUploadingQris(false);
        }
    };

    // Handler Hapus QRIS
    const handleRemoveQris = () => {
        setQrisFile(null);
        setQrisPreviewUrl('');
        setQrisImageUrl('');
    };

    // Handler Validasi Form Sebelum Submit (Wajib QRIS atau Rekening Bank)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const hasQris = !!qrisFile || !!qrisImageUrl;
        const hasBank = !!bankName.trim() && !!bankAccountNumber.trim();

        if (!hasQris && !hasBank) {
            e.preventDefault();
            Swal.fire({
                title: 'Metode Pembayaran Wajib',
                text: 'Harap lengkapi metode pembayaran! Unggah QRIS atau isi detail Rekening Bank.',
                icon: 'warning',
                confirmButtonColor: '#D97706',
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                },
            });
            return;
        }

        // Jika QRIS dipilih tapi upload Cloudinary belum selesai
        if (qrisFile && !qrisImageUrl) {
            if (isUploadingQris) {
                e.preventDefault();
                Swal.fire({
                    title: 'Mengunggah Gambar QRIS',
                    text: 'Mohon tunggu sebentar, gambar QRIS sedang diunggah ke Cloudinary...',
                    icon: 'info',
                    confirmButtonColor: '#D97706',
                    confirmButtonText: 'Mengerti',
                    customClass: {
                        popup: 'rounded-3xl font-sans',
                        confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                    },
                });
                return;
            }

            // Upaya upload ulang jika sebelumnya pending/gagal
            e.preventDefault();
            try {
                setIsUploadingQris(true);
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'p2jfvcqi';
                const formData = new FormData();
                formData.append('file', qrisFile);
                formData.append('upload_preset', 'lora_toko');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Gagal mengunggah gambar QRIS ke Cloudinary.');
                }

                const data = await response.json();
                const uploadedUrl = data.secure_url;
                setQrisImageUrl(uploadedUrl);
                setIsUploadingQris(false);

                const formElement = e.currentTarget;
                const hiddenInput = formElement.querySelector<HTMLInputElement>('input[name="qris_image_url"]');
                if (hiddenInput) {
                    hiddenInput.value = uploadedUrl;
                }
                formElement.requestSubmit();
            } catch (err: any) {
                setIsUploadingQris(false);
                Swal.fire({
                    title: 'Gagal Unggah QRIS',
                    text: err.message || 'Terjadi kesalahan saat mengunggah QRIS.',
                    icon: 'error',
                    confirmButtonColor: '#D97706',
                    confirmButtonText: 'Mengerti',
                    customClass: {
                        popup: 'rounded-3xl font-sans',
                        confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                    },
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-terracotta selection:text-white flex flex-col justify-between py-10 px-4 sm:px-6">
            {/* Main Form Container */}
            <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
                {/* Navigation Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-terracotta transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali ke Beranda</span>
                </Link>

                {/* Form Card Surface */}
                <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
                    {/* Header Title */}
                    <div className="space-y-2 border-b border-slate-100 pb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                            <Store className="w-3.5 h-3.5 text-amber-700" />
                            <span>Pendaftaran Toko (Business)</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
                            Buka Toko Digital Anda
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                            Lengkapi informasi bisnis Anda untuk mulai berjualan dan nikmati asisten AI LORA untuk optimalisasi omzet UMKM.
                        </p>
                    </div>

                    {/* Error Alert Box */}
                    {state?.error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-3 animate-in fade-in duration-200">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-bold">Gagal Mendaftarkan Toko</p>
                                <p>{state.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
                        {/* Hidden Inputs untuk Mengirimkan URL Foto Logo, Banner, & QRIS ke Server Action */}
                        <input type="hidden" name="logo_url" value={logoUrl} />
                        <input type="hidden" name="banner_url" value={bannerUrl} />
                        <input type="hidden" name="qris_image_url" value={qrisImageUrl} />

                        {/* Hidden Inputs untuk Menyisipkan Data ID & Nama Wilayah ke Server Action */}
                        <input type="hidden" name="province_id" value={selectedProvince?.id || ''} />
                        <input type="hidden" name="province_name" value={selectedProvince?.name || ''} />
                        <input type="hidden" name="city_id" value={selectedCity?.id || ''} />
                        <input type="hidden" name="city_name" value={selectedCity?.name || ''} />
                        <input type="hidden" name="district_id" value={selectedDistrict?.id || ''} />
                        <input type="hidden" name="district_name" value={selectedDistrict?.name || ''} />
                        <input type="hidden" name="village_id" value={selectedVillage?.id || ''} />
                        <input type="hidden" name="village_name" value={selectedVillage?.name || ''} />

                        {/* BAGIAN 1: INFORMASI DASAR */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="flex items-center justify-center w-7 h-7 bg-terracotta/10 text-terracotta rounded-full font-bold text-xs">
                                    1
                                </span>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Informasi Dasar Toko</h2>
                                    <p className="text-xs text-slate-500">Profil utama bisnis yang akan dilihat oleh pelanggan</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Input: Nama Toko */}
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Nama Toko <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Contoh: Batik Solo / Bakpia Pathok 25"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Slug URL toko akan dibuat otomatis berdasarkan nama toko ini (contoh: <code>batik-solo</code>).
                                    </p>
                                </div>

                                {/* Input: Deskripsi Singkat Toko */}
                                <div className="space-y-1.5">
                                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Deskripsi Singkat Toko <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        placeholder="Ceritakan singkat produk unggulan, keunikan, atau asal usaha Anda..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Input: Foto Logo / Profil Toko (Komponen ImageUpload dengan Pratinjau & Tombol Gunakan Foto Ini) */}
                                <ImageUpload
                                    value={logoUrl}
                                    label="Foto Logo / Profil Toko (Opsional)"
                                    helperText="Format JPG, PNG, atau WEBP. Disarankan rasio 1:1."
                                    aspectRatio="square"
                                    onConfirm={(url) => setLogoUrl(url)}
                                    onRemove={() => setLogoUrl('')}
                                />

                                {/* Input: Foto Banner Toko (Komponen ImageUpload dengan Pratinjau & Tombol Gunakan Foto Ini) */}
                                <ImageUpload
                                    value={bannerUrl}
                                    label="Foto Banner / Sampul Toko (Opsional)"
                                    helperText="Format JPG, PNG, atau WEBP. Disarankan rasio 16:9."
                                    aspectRatio="banner"
                                    onConfirm={(url) => setBannerUrl(url)}
                                    onRemove={() => setBannerUrl('')}
                                />
                            </div>
                        </section>

                        {/* BAGIAN 2: DETAIL LOKASI */}
                        <section className="space-y-5 pt-2">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="flex items-center justify-center w-7 h-7 bg-terracotta/10 text-terracotta rounded-full font-bold text-xs">
                                    2
                                </span>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Detail Lokasi Toko</h2>
                                    <p className="text-xs text-slate-500">Alamat operasional dan pengiriman barang (Cascading Dropdown API Wilayah)</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Hidden Inputs untuk Mengirim Nilai ID & Nama Wilayah ke Server Action */}
                                <input type="hidden" name="province_id" value={selectedProvince?.id || ''} />
                                <input type="hidden" name="province_name" value={selectedProvince?.name || ''} />
                                <input type="hidden" name="city_id" value={selectedCity?.id || ''} />
                                <input type="hidden" name="city_name" value={selectedCity?.name || ''} />
                                <input type="hidden" name="district_id" value={selectedDistrict?.id || ''} />
                                <input type="hidden" name="district_name" value={selectedDistrict?.name || ''} />
                                <input type="hidden" name="village_id" value={selectedVillage?.id || ''} />
                                <input type="hidden" name="village_name" value={selectedVillage?.name || ''} />

                                {/* Form Grid untuk Searchable Combobox Dropdowns (API Wilayah Indonesia) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Combobox 1: Provinsi */}
                                    <Combobox
                                        label="Provinsi"
                                        options={provinces}
                                        value={selectedProvince}
                                        onChange={(opt) => {
                                            setSelectedProvince(opt);
                                            setSelectedCity(null);
                                            setSelectedDistrict(null);
                                            setSelectedVillage(null);
                                        }}
                                        placeholder="Pilih Provinsi..."
                                        searchPlaceholder="Cari Provinsi..."
                                        loading={loadingProvinces}
                                    />

                                    {/* Combobox 2: Kota / Kabupaten */}
                                    <Combobox
                                        label="Kota / Kabupaten"
                                        options={cities}
                                        value={selectedCity}
                                        onChange={(opt) => {
                                            setSelectedCity(opt ? { ...opt, province_id: selectedProvince?.id || '' } : null);
                                            setSelectedDistrict(null);
                                            setSelectedVillage(null);
                                        }}
                                        placeholder={selectedProvince ? 'Pilih Kota/Kabupaten...' : 'Pilih Provinsi terlebih dahulu'}
                                        searchPlaceholder="Cari Kota/Kabupaten..."
                                        disabled={!selectedProvince}
                                        loading={loadingCities}
                                    />

                                    {/* Combobox 3: Kecamatan */}
                                    <Combobox
                                        label="Kecamatan"
                                        options={districts}
                                        value={selectedDistrict}
                                        onChange={(opt) => {
                                            setSelectedDistrict(opt ? { ...opt, regency_id: selectedCity?.id || '' } : null);
                                            setSelectedVillage(null);
                                        }}
                                        placeholder={selectedCity ? 'Pilih Kecamatan...' : 'Pilih Kota terlebih dahulu'}
                                        searchPlaceholder="Cari Kecamatan..."
                                        disabled={!selectedCity}
                                        loading={loadingDistricts}
                                    />

                                    {/* Combobox 4: Kelurahan / Desa */}
                                    <Combobox
                                        label="Kelurahan / Desa"
                                        options={villages}
                                        value={selectedVillage}
                                        onChange={(opt) => {
                                            setSelectedVillage(opt ? { ...opt, district_id: selectedDistrict?.id || '' } : null);
                                        }}
                                        placeholder={selectedDistrict ? 'Pilih Kelurahan/Desa...' : 'Pilih Kecamatan terlebih dahulu'}
                                        searchPlaceholder="Cari Kelurahan/Desa..."
                                        disabled={!selectedDistrict}
                                        loading={loadingVillages}
                                    />
                                </div>

                                {/* Input: Tautan Google Maps */}
                                <div className="space-y-1.5">
                                    <label htmlFor="google_maps_link" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Tautan Google Maps <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="google_maps_link"
                                        name="google_maps_link"
                                        placeholder="https://maps.google.com/..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Link lokasi titik Google Maps tempat usaha Anda.
                                    </p>
                                </div>

                                {/* Input: Alamat Lengkap */}
                                <div className="space-y-1.5">
                                    <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Alamat Lengkap <span className="text-slate-400 font-normal">(Jalan, No. Rumah, RT/RW, Patokan)</span>
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        placeholder="Tuliskan alamat lengkap beserta patokan toko Anda..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* BAGIAN 3: METODE PEMBAYARAN */}
                        <section className="space-y-5 pt-2">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="flex items-center justify-center w-7 h-7 bg-terracotta/10 text-terracotta rounded-full font-bold text-xs">
                                    3
                                </span>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Metode Pembayaran <span className="text-xs font-normal text-rose-500">(Wajib isi minimal salah satu)</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Unggah gambar QRIS toko atau isi detail Rekening Bank untuk penerimaan pembayaran transaksi
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Input 1: QRIS */}
                                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="qris_file_input" className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <QrCode className="w-4 h-4 text-terracotta" />
                                            <span>1. Unggah Gambar QRIS</span>
                                            <span className="text-[10px] text-slate-400 font-normal lowercase">(opsional jika ada rekening bank)</span>
                                        </label>
                                    </div>

                                    <div>
                                        {qrisPreviewUrl || qrisImageUrl ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl">
                                                <img
                                                    src={qrisPreviewUrl || qrisImageUrl}
                                                    alt="Preview QRIS Toko"
                                                    className="w-32 h-32 object-contain bg-white p-2 border border-slate-200 rounded-lg shadow-sm"
                                                />
                                                <div className="space-y-2 text-center sm:text-left">
                                                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 justify-center sm:justify-start">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Gambar QRIS Siap</span>
                                                        {isUploadingQris && <span className="text-amber-600 text-[11px] font-normal animate-pulse">(Mengunggah...)</span>}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate max-w-xs">
                                                        {qrisFile ? qrisFile.name : 'Gambar QRIS berhasil diunggah'}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveQris}
                                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Hapus Gambar QRIS</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="qris_file_input"
                                                    accept="image/*"
                                                    onChange={handleQrisFileChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="qris_file_input"
                                                    className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 hover:border-terracotta rounded-xl cursor-pointer transition-all hover:bg-amber-50/30 text-center group"
                                                >
                                                    <div className="w-12 h-12 bg-amber-50 group-hover:bg-terracotta/10 text-amber-600 group-hover:text-terracotta rounded-full flex items-center justify-center mb-2 transition-colors">
                                                        <UploadCloud className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        Klik untuk Unggah Gambar QRIS Toko
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        Format JPG, PNG, atau WEBP (Maksimal 5MB)
                                                    </p>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Input 2 & 3: Rekening Bank */}
                                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-terracotta" />
                                        <span>2 & 3. Detail Rekening Bank</span>
                                        <span className="text-[10px] text-slate-400 font-normal lowercase">(opsional jika sudah mengunggah QRIS)</span>
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Input 2: Dropdown (Select) Bank Name */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="bank_name" className="block text-xs font-semibold text-slate-700">
                                                Nama Bank
                                            </label>
                                            <select
                                                id="bank_name"
                                                name="bank_name"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all cursor-pointer"
                                            >
                                                <option value="">-- Pilih Bank --</option>
                                                {BANK_OPTIONS.map((bank) => (
                                                    <option key={bank} value={bank}>
                                                        {bank}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Input 3: Nomor Rekening Bank */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="bank_account_number" className="block text-xs font-semibold text-slate-700">
                                                Nomor Rekening Bank
                                            </label>
                                            <input
                                                type="text"
                                                id="bank_account_number"
                                                name="bank_account_number"
                                                value={bankAccountNumber}
                                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                                placeholder="Contoh: 1234567890"
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 px-6 bg-terracotta hover:bg-terracotta-hover active:scale-[0.99] disabled:opacity-70 text-white font-bold text-sm rounded-2xl shadow-lg shadow-terracotta/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isPending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Memproses Pendaftaran Toko...</span>
                                    </>
                                ) : (
                                    <span>Daftarkan Toko Sekarang</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Minimalis */}
            <footer className="text-center text-xs text-slate-400 pt-8">
                <p>© 2026 LORA Regional Assistant. Seluruh hak cipta dilindungi.</p>
            </footer>
        </div>
    );
}
