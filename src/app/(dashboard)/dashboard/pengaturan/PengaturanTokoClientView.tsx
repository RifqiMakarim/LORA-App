'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Save, Loader2, Phone, MapPin, CreditCard, Building2, ShieldCheck, Globe, Link2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import ImageUpload from '@/components/ImageUpload';
import Combobox, { ComboboxOption } from '@/components/ui/Combobox';
import { updateBusinessSettings } from '@/app/actions/business';

interface BusinessData {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    contact_number?: string | null;
    province_id?: string | null;
    province_name?: string | null;
    city_id?: string | null;
    city_name?: string | null;
    district_id?: string | null;
    district_name?: string | null;
    village_id?: string | null;
    village_name?: string | null;
    address?: string | null;
    google_maps_link?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    qris_image_url?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
}

interface PengaturanTokoClientViewProps {
    business: BusinessData;
}

type Province = { id: string; name: string };
type Regency = { id: string; province_id: string; name: string };
type District = { id: string; regency_id: string; name: string };
type Village = { id: string; district_id: string; name: string };

const BANK_OPTIONS = [
    'BCA',
    'Mandiri',
    'BNI',
    'BRI',
    'Syarikat Islam (BSI)',
    'CIMB Niaga',
    'BJB',
    'Lainnya',
];

export default function PengaturanTokoClientView({ business }: PengaturanTokoClientViewProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Section 1: Informasi Dasar & Kontak State (Pre-filled)
    const [name, setName] = useState(business.name || '');
    const slug = business.slug || '';
    const [description, setDescription] = useState(business.description || '');
    const [contactNumber, setContactNumber] = useState(business.contact_number || '');

    // State Options List Wilayah Indonesia (EMSIFA API)
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    // State Selected Objects Wilayah (Pre-filled dari Database Supabase)
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(
        business.province_id && business.province_name
            ? { id: business.province_id, name: business.province_name }
            : null
    );
    const [selectedCity, setSelectedCity] = useState<Regency | null>(
        business.city_id && business.city_name
            ? { id: business.city_id, name: business.city_name, province_id: business.province_id || '' }
            : null
    );
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
        business.district_id && business.district_name
            ? { id: business.district_id, name: business.district_name, regency_id: business.city_id || '' }
            : null
    );
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(
        business.village_id && business.village_name
            ? { id: business.village_id, name: business.village_name, district_id: business.district_id || '' }
            : null
    );

    // Loading State untuk UX Combobox
    const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);
    const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
    const [loadingVillages, setLoadingVillages] = useState<boolean>(false);
    const [address, setAddress] = useState(business.address || '');
    const [googleMapsLink, setGoogleMapsLink] = useState(business.google_maps_link || '');

    // Section 3: Media, Branding & Metode Pembayaran State (Pre-filled)
    const [logoUrl, setLogoUrl] = useState(business.logo_url || '');
    const [bannerUrl, setBannerUrl] = useState(business.banner_url || '');
    const [qrisImageUrl, setQrisImageUrl] = useState(business.qris_image_url || '');
    const [bankName, setBankName] = useState(business.bank_name || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(business.bank_account_number || '');

    // 1. Fetch Daftar Provinsi saat Komponen Pertama Dimuat
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
                console.error('Gagal memuat daftar provinsi:', err);
            } finally {
                setLoadingProvinces(false);
            }
        }
        fetchProvinces();
    }, []);

    // 2. Fetch Daftar Kota/Kabupaten saat Provinsi Terpilih
    useEffect(() => {
        const provId = selectedProvince?.id;
        if (!provId) {
            setCities([]);
            return;
        }

        async function fetchCities() {
            setLoadingCities(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`);
                if (res.ok) {
                    const data: Regency[] = await res.json();
                    setCities(data);
                }
            } catch (err) {
                console.error('Gagal memuat daftar kota/kabupaten:', err);
            } finally {
                setLoadingCities(false);
            }
        }
        fetchCities();
    }, [selectedProvince?.id]);

    // 3. Fetch Daftar Kecamatan saat Kota Terpilih
    useEffect(() => {
        const cityId = selectedCity?.id;
        if (!cityId) {
            setDistricts([]);
            return;
        }

        async function fetchDistricts() {
            setLoadingDistricts(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
                if (res.ok) {
                    const data: District[] = await res.json();
                    setDistricts(data);
                }
            } catch (err) {
                console.error('Gagal memuat daftar kecamatan:', err);
            } finally {
                setLoadingDistricts(false);
            }
        }
        fetchDistricts();
    }, [selectedCity?.id]);

    // 4. Fetch Daftar Kelurahan saat Kecamatan Terpilih
    useEffect(() => {
        const distId = selectedDistrict?.id;
        if (!distId) {
            setVillages([]);
            return;
        }

        async function fetchVillages() {
            setLoadingVillages(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${distId}.json`);
                if (res.ok) {
                    const data: Village[] = await res.json();
                    setVillages(data);
                }
            } catch (err) {
                console.error('Gagal memuat daftar kelurahan:', err);
            } finally {
                setLoadingVillages(false);
            }
        }
        fetchVillages();
    }, [selectedDistrict?.id]);

    // Handlers Pemilih Wilayah Berjenjang (Reset Turunan jika Atasan Berubah)
    const handleProvinceChange = (opt: ComboboxOption | null) => {
        setSelectedProvince(opt);
        setSelectedCity(null);
        setSelectedDistrict(null);
        setSelectedVillage(null);
    };

    const handleCityChange = (opt: ComboboxOption | null) => {
        setSelectedCity(opt ? { ...opt, province_id: selectedProvince?.id || '' } : null);
        setSelectedDistrict(null);
        setSelectedVillage(null);
    };

    const handleDistrictChange = (opt: ComboboxOption | null) => {
        setSelectedDistrict(opt ? { ...opt, regency_id: selectedCity?.id || '' } : null);
        setSelectedVillage(null);
    };

    const handleVillageChange = (opt: ComboboxOption | null) => {
        setSelectedVillage(opt ? { ...opt, district_id: selectedDistrict?.id || '' } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Nama toko wajib diisi');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Menyimpan perubahan profil toko...');

        try {
            const res = await updateBusinessSettings({
                id: business.id,
                name: name.trim(),
                slug,
                description: description.trim(),
                contact_number: contactNumber.trim(),
                province_id: selectedProvince?.id || '',
                province_name: selectedProvince?.name || '',
                city_id: selectedCity?.id || '',
                city_name: selectedCity?.name || '',
                district_id: selectedDistrict?.id || '',
                district_name: selectedDistrict?.name || '',
                village_id: selectedVillage?.id || '',
                village_name: selectedVillage?.name || '',
                address: address.trim(),
                google_maps_link: googleMapsLink.trim(),
                logo_url: logoUrl,
                banner_url: bannerUrl,
                qris_image_url: qrisImageUrl,
                bank_name: bankName,
                bank_account_number: bankAccountNumber.trim(),
            });

            if (res.error) {
                throw new Error(res.error);
            }

            // 1. Notifikasi Toast Sukses
            toast.success('Profil toko berhasil diperbarui!', { id: loadingToast });

            // 2. Dialog Modal SweetAlert2 dengan Auto Restore Scroll Body
            await Swal.fire({
                title: 'Profil Toko Diperbarui!',
                text: 'Seluruh data informasi, alamat, dan media toko Anda telah berhasil diperbarui.',
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

            // Restore body scroll inline secara eksplisit jika tertahan oleh Chrome
            if (typeof document !== 'undefined') {
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '0px';
                document.documentElement.style.overflow = 'auto';
                document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
            }

            // 3. Refresh Data Halaman & Header UI
            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (err: any) {
            console.error('Gagal memperbarui profil toko:', err);
            toast.error(err.message || 'Gagal memperbarui profil toko', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header Page Title Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
                        <Store className="w-3.5 h-3.5" />
                        <span>Pengaturan Toko LORA</span>
                    </div>
                    <h1 className="text-2xl font-outfit font-black text-slate-900 tracking-tight">
                        Pengaturan Profil Toko
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Kelola data informasi dasar, wilayah operasional, alamat, dan media branding UMKM Anda
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Status Toko:</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aktif Berjualan
                    </span>
                </div>
            </div>

            {/* Form Utama (3 Section Terstruktur) */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION 1: INFORMASI DASAR & KONTAK */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-terracotta" />
                        <div>
                            <h2 className="text-base font-bold text-slate-900">1. Informasi Dasar & Kontak</h2>
                            <p className="text-xs text-slate-400">Profil identitas utama dan kontak WhatsApp toko Anda</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Grid Nama Toko & Slug URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Input: Nama Toko */}
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Nama Toko <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Dapur Bu Titik"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all"
                                />
                            </div>

                            {/* Input: URL Slug (Read-only) */}
                            <div className="space-y-1.5">
                                <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                                    <span>Slug URL Toko</span>
                                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        Read-only
                                    </span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Link2 className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        id="slug"
                                        value={slug}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Domain Etalase: <span className="font-mono text-terracotta font-bold">/toko/{slug}</span>
                                </p>
                            </div>
                        </div>

                        {/* Input: Deskripsi Toko */}
                        <div className="space-y-1.5">
                            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Deskripsi Toko <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Jelaskan jenis kuliner/produk unggulan, asal usaha, atau informasi operasional toko Anda..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Input: Nomor WA Toko */}
                        <div className="space-y-1.5">
                            <label htmlFor="contact_number" className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Nomor WhatsApp Toko</span>
                            </label>
                            <input
                                type="text"
                                id="contact_number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all font-mono"
                            />
                            <p className="text-[11px] text-slate-400">
                                Digunakan untuk menerima pesan notifikasi pesanan Fonnte WA dan kontak pembeli.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DETAIL ALAMAT LENGKAP & WILAYAH (Combobox Searchable Dropdowns) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-terracotta" />
                        <div>
                            <h2 className="text-base font-bold text-slate-900">2. Detail Alamat Lengkap & Wilayah (Cascading API EMSIFA)</h2>
                            <p className="text-xs text-slate-400">Lokasi geografis berjenjang dan alamat operasional toko fisik/stand Anda</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Grid Combobox Searchable Dropdowns Wilayah Indonesia */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 1. Combobox Provinsi */}
                            <Combobox
                                label="Provinsi"
                                options={provinces}
                                value={selectedProvince}
                                onChange={handleProvinceChange}
                                placeholder="Pilih Provinsi..."
                                searchPlaceholder="Cari Provinsi..."
                                loading={loadingProvinces}
                            />

                            {/* 2. Combobox Kota / Kabupaten */}
                            <Combobox
                                label="Kota / Kabupaten"
                                options={cities}
                                value={selectedCity}
                                onChange={handleCityChange}
                                placeholder={selectedProvince ? 'Pilih Kota/Kabupaten...' : 'Pilih Provinsi dulu'}
                                searchPlaceholder="Cari Kota/Kabupaten..."
                                disabled={!selectedProvince}
                                loading={loadingCities}
                            />

                            {/* 3. Combobox Kecamatan */}
                            <Combobox
                                label="Kecamatan"
                                options={districts}
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                placeholder={selectedCity ? 'Pilih Kecamatan...' : 'Pilih Kota dulu'}
                                searchPlaceholder="Cari Kecamatan..."
                                disabled={!selectedCity}
                                loading={loadingDistricts}
                            />

                            {/* 4. Combobox Kelurahan / Desa */}
                            <Combobox
                                label="Kelurahan / Desa"
                                options={villages}
                                value={selectedVillage}
                                onChange={handleVillageChange}
                                placeholder={selectedDistrict ? 'Pilih Kelurahan/Desa...' : 'Pilih Kecamatan dulu'}
                                searchPlaceholder="Cari Kelurahan/Desa..."
                                disabled={!selectedDistrict}
                                loading={loadingVillages}
                            />
                        </div>

                        {/* Textarea: Alamat Jalan / Detail */}
                        <div className="space-y-1.5">
                            <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Alamat Jalan & Detail Stand / Bangunan
                            </label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                placeholder="Jalan Malioboro No. 12, Stand No. B-05, Dekat Benteng Vredeburg..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Input: Google Maps Link */}
                        <div className="space-y-1.5">
                            <label htmlFor="google_maps_link" className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                <span>Tautan Google Maps Toko (URL)</span>
                            </label>
                            <input
                                type="url"
                                id="google_maps_link"
                                value={googleMapsLink}
                                onChange={(e) => setGoogleMapsLink(e.target.value)}
                                placeholder="https://maps.google.com/?q=..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: MEDIA & BRANDING */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-terracotta" />
                        <div>
                            <h2 className="text-base font-bold text-slate-900">3. Media & Branding Visual Toko</h2>
                            <p className="text-xs text-slate-400">Unggah foto logo, banner header toko, dan kode QRIS pembayaran</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload Logo */}
                        <ImageUpload
                            value={logoUrl}
                            label="Foto Logo / Profil Toko"
                            helperText="Format JPG, PNG, atau WEBP (Rasio 1:1)"
                            aspectRatio="square"
                            onConfirm={(url) => setLogoUrl(url)}
                            onRemove={() => setLogoUrl('')}
                        />

                        {/* Upload Banner */}
                        <ImageUpload
                            value={bannerUrl}
                            label="Foto Banner / Sampul Header Toko"
                            helperText="Format JPG, PNG, atau WEBP (Rasio 16:9)"
                            aspectRatio="banner"
                            onConfirm={(url) => setBannerUrl(url)}
                            onRemove={() => setBannerUrl('')}
                        />
                    </div>

                    {/* Sub-Section: Metode Pembayaran Digital (QRIS & Bank) */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-terracotta" />
                            <span>Metode Pembayaran Digital</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Upload QRIS */}
                            <ImageUpload
                                value={qrisImageUrl}
                                label="Gambar Kode QRIS Toko"
                                helperText="Pindai QRIS cepat untuk pembeli di kasir"
                                aspectRatio="square"
                                onConfirm={(url) => setQrisImageUrl(url)}
                                onRemove={() => setQrisImageUrl('')}
                            />

                            {/* Detail Rekening Bank */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Detail Rekening Bank Transfer
                                </label>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label htmlFor="bank_name" className="block text-xs font-semibold text-slate-600">
                                            Nama Bank
                                        </label>
                                        <select
                                            id="bank_name"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all cursor-pointer"
                                        >
                                            <option value="">-- Pilih Bank --</option>
                                            {BANK_OPTIONS.map((bank) => (
                                                <option key={bank} value={bank}>
                                                    {bank}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="bank_account_number" className="block text-xs font-semibold text-slate-600">
                                            Nomor Rekening Bank
                                        </label>
                                        <input
                                            type="text"
                                            id="bank_account_number"
                                            value={bankAccountNumber}
                                            onChange={(e) => setBankAccountNumber(e.target.value)}
                                            placeholder="Contoh: 1234567890"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Action Footer Bar */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between gap-4 sticky bottom-4 z-20">
                    <p className="text-xs text-slate-500 font-medium hidden sm:block">
                        Perubahan akan langsung ter-update di etalase publik toko Anda
                    </p>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-terracotta/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan Perubahan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan Toko</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
