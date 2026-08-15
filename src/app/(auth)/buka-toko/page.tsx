'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import { registerBusiness } from '@/app/actions/business';

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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-terracotta selection:text-white flex flex-col justify-between py-10 px-4 sm:px-6">
            {/* Main Form Container */}
            <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
                {/* Navigation Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-terracotta transition-colors group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
                    <span>Kembali ke Beranda</span>
                </Link>

                {/* Form Card Surface */}
                <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 w-full max-w-2xl mx-auto">
                    {/* Header Title */}
                    <div className="space-y-2 border-b border-slate-100 pb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                            🏪 Pendaftaran Toko (Business)
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
                            <span className="text-base leading-none">⚠️</span>
                            <div className="space-y-0.5">
                                <p className="font-bold">Gagal Mendaftarkan Toko</p>
                                <p>{state.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form action={formAction} className="space-y-8">
                        {/* Hidden Inputs untuk Mengirimkan URL Foto Logo & Banner ke Server Action */}
                        <input type="hidden" name="logo_url" value={logoUrl} />
                        <input type="hidden" name="banner_url" value={bannerUrl} />

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

                                {/* Input: Foto Logo / Profil Toko (Cloudinary Widget) */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Foto Logo / Profil Toko <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <div>
                                        {logoUrl ? (
                                            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                                <img
                                                    src={logoUrl}
                                                    alt="Preview Logo Toko"
                                                    className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-sm"
                                                />
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                                        <span>✓</span> Logo Berhasil Diunggah
                                                    </p>
                                                    <CldUploadWidget
                                                        uploadPreset="lora_toko"
                                                        onSuccess={(result) => {
                                                            if (typeof result.info !== 'string' && result.info?.secure_url) {
                                                                setLogoUrl(result.info.secure_url);
                                                            }
                                                        }}
                                                    >
                                                        {({ open }) => (
                                                            <button
                                                                type="button"
                                                                onClick={() => open()}
                                                                className="text-xs font-bold text-terracotta hover:text-terracotta-hover underline cursor-pointer"
                                                            >
                                                                🔄 Ganti Foto Logo
                                                            </button>
                                                        )}
                                                    </CldUploadWidget>
                                                </div>
                                            </div>
                                        ) : (
                                            <CldUploadWidget
                                                uploadPreset="lora_toko"
                                                onSuccess={(result) => {
                                                    if (typeof result.info !== 'string' && result.info?.secure_url) {
                                                        setLogoUrl(result.info.secure_url);
                                                    }
                                                }}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <span>📷</span>
                                                        <span>Upload Logo Toko</span>
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Format JPG, PNG, atau WEBP. Disarankan rasio 1:1.
                                    </p>
                                </div>

                                {/* Input: Foto Banner Toko (Cloudinary Widget) */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Foto Banner / Sampul Toko <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <div>
                                        {bannerUrl ? (
                                            <div className="relative border border-slate-200 rounded-2xl overflow-hidden group max-w-md">
                                                <img
                                                    src={bannerUrl}
                                                    alt="Preview Banner Toko"
                                                    className="w-full h-32 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <CldUploadWidget
                                                        uploadPreset="lora_toko"
                                                        onSuccess={(result) => {
                                                            if (typeof result.info !== 'string' && result.info?.secure_url) {
                                                                setBannerUrl(result.info.secure_url);
                                                            }
                                                        }}
                                                    >
                                                        {({ open }) => (
                                                            <button
                                                                type="button"
                                                                onClick={() => open()}
                                                                className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                                                            >
                                                                🔄 Ganti Foto Banner
                                                            </button>
                                                        )}
                                                    </CldUploadWidget>
                                                </div>
                                            </div>
                                        ) : (
                                            <CldUploadWidget
                                                uploadPreset="lora_toko"
                                                onSuccess={(result) => {
                                                    if (typeof result.info !== 'string' && result.info?.secure_url) {
                                                        setBannerUrl(result.info.secure_url);
                                                    }
                                                }}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-dashed"
                                                    >
                                                        <span>🖼️</span>
                                                        <span>Upload Banner Toko</span>
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Format JPG, PNG, atau WEBP. Disarankan rasio lanskap (16:9 atau 3:1).
                                    </p>
                                </div>
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
                                {/* Form Grid untuk Cascading Dropdown (API Wilayah Indonesia) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Dropdown 1: Provinsi */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="province_select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Provinsi
                                        </label>
                                        <select
                                            id="province_select"
                                            value={selectedProvince?.id || ''}
                                            onChange={handleProvinceChange}
                                            disabled={loadingProvinces}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{loadingProvinces ? 'Memuat Provinsi...' : '-- Pilih Provinsi --'}</option>
                                            {provinces.map((prov) => (
                                                <option key={prov.id} value={prov.id}>
                                                    {prov.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dropdown 2: Kota / Kabupaten */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="city_select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Kota / Kabupaten
                                        </label>
                                        <select
                                            id="city_select"
                                            value={selectedCity?.id || ''}
                                            onChange={handleCityChange}
                                            disabled={!selectedProvince || loadingCities}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {loadingCities
                                                    ? 'Memuat Kota/Kabupaten...'
                                                    : !selectedProvince
                                                        ? '-- Pilih Provinsi Terlebih Dahulu --'
                                                        : '-- Pilih Kota / Kabupaten --'}
                                            </option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dropdown 3: Kecamatan */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="district_select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Kecamatan
                                        </label>
                                        <select
                                            id="district_select"
                                            value={selectedDistrict?.id || ''}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedCity || loadingDistricts}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {loadingDistricts
                                                    ? 'Memuat Kecamatan...'
                                                    : !selectedCity
                                                        ? '-- Pilih Kota Terlebih Dahulu --'
                                                        : '-- Pilih Kecamatan --'}
                                            </option>
                                            {districts.map((dist) => (
                                                <option key={dist.id} value={dist.id}>
                                                    {dist.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dropdown 4: Kelurahan / Desa */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="village_select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Kelurahan / Desa
                                        </label>
                                        <select
                                            id="village_select"
                                            value={selectedVillage?.id || ''}
                                            onChange={handleVillageChange}
                                            disabled={!selectedDistrict || loadingVillages}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {loadingVillages
                                                    ? 'Memuat Kelurahan/Desa...'
                                                    : !selectedDistrict
                                                        ? '-- Pilih Kecamatan Terlebih Dahulu --'
                                                        : '-- Pilih Kelurahan / Desa --'}
                                            </option>
                                            {villages.map((vill) => (
                                                <option key={vill.id} value={vill.id}>
                                                    {vill.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                                    <>
                                        <span>Daftarkan Toko Sekarang</span>
                                        <span>🚀</span>
                                    </>
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
