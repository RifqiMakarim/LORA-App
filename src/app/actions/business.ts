'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis';

export type RegisterBusinessState = {
    error?: string;
    success?: boolean;
} | null;

/**
 * Logika generator slug otomatis dari nama toko (Regex: ubah spasi menjadi strip & huruf kecil)
 * Contoh: 'Batik Solo' -> 'batik-solo'
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric kecuali spasi dan strip
        .replace(/\s+/g, '-')         // Ubah spasi menjadi strip
        .replace(/-+/g, '-');        // Gabungkan multiple strip
}

/**
 * Server Action untuk Pendaftaran Toko (Business)
 */
export async function registerBusiness(
    prevStateOrFormData: RegisterBusinessState | FormData,
    formDataParam?: FormData
): Promise<RegisterBusinessState> {
    const supabase = await createClient();

    // Resolusi parameter formData untuk mendukung panggilan via useActionState atau form action langsung
    let formData: FormData;
    if (prevStateOrFormData instanceof FormData) {
        formData = prevStateOrFormData;
    } else if (formDataParam instanceof FormData) {
        formData = formDataParam;
    } else {
        return { error: 'Data formulir tidak valid.' };
    }

    // 1. Ambil user.id dari Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Anda harus masuk (login) terlebih dahulu untuk mendaftarkan toko.' };
    }

    // 1b. Cek apakah pengguna sudah memiliki toko di tabel businesses (mencegah registrasi ulang / error saat retry)
    const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

    if (existingBusiness) {
        // Toko sudah terdaftar, pastikan is_seller = true pada profiles dan langsung redirect ke dashboard
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const { error: syncError } = await supabase
                    .from('profiles')
                    .update({ is_seller: true, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                if (!syncError) break;
            } catch (e) {
                console.warn(`[registerBusiness] Existing business sync attempt ${attempt + 1} error:`, e);
            }
            await new Promise((res) => setTimeout(res, 200));
        }
        revalidatePath('/', 'layout');
        redirect('/dashboard');
    }

    // 2. Ambil contact_number langsung dari tabel profiles berdasarkan user.id
    const { data: profileData } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', user.id)
        .maybeSingle();

    const contactNumber = profileData?.phone_number || null;

    // 3. Tangkap SEMUA input dari form
    const name = (formData.get('name') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const logo_url = (formData.get('logo_url') as string || '').trim();
    const banner_url = (formData.get('banner_url') as string || '').trim();

    // Tangkap data lokasi (ID & Nama untuk API Wilayah)
    const province_id = (formData.get('province_id') as string || '').trim();
    const province_name = (formData.get('province_name') as string || '').trim();
    const city_id = (formData.get('city_id') as string || '').trim();
    const city_name = (formData.get('city_name') as string || '').trim();
    const district_id = (formData.get('district_id') as string || '').trim();
    const district_name = (formData.get('district_name') as string || '').trim();
    const village_id = (formData.get('village_id') as string || '').trim();
    const village_name = (formData.get('village_name') as string || '').trim();

    const address = (formData.get('address') as string || '').trim();
    const google_maps_link = (formData.get('google_maps_link') as string || '').trim();

    // Tangkap data Metode Pembayaran (QRIS & Rekening Bank)
    const qris_image_url = (formData.get('qris_image_url') as string || '').trim();
    const bank_name = (formData.get('bank_name') as string || '').trim();
    const bank_account_number = (formData.get('bank_account_number') as string || '').trim();

    if (!name) {
        return { error: 'Nama Toko wajib diisi.' };
    }

    // Validasi Metode Pembayaran (Minimal salah satu: QRIS atau Bank)
    if (!qris_image_url && (!bank_name || !bank_account_number)) {
        return { error: 'Harap lengkapi metode pembayaran! Unggah QRIS atau isi detail Rekening Bank.' };
    }

    // 4. Generate slug otomatis menggunakan regex
    let slug = generateSlug(name);
    if (!slug) {
        return { error: 'Nama toko harus mengandung setidaknya satu huruf atau angka.' };
    }

    // 5. Lakukan insert ke tabel businesses dengan seluruh field tersinkronisasi
    const businessPayload = {
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        logo_url: logo_url || null,
        banner_url: banner_url || null,
        qris_image_url: qris_image_url || null,
        bank_name: bank_name || null,
        bank_account_number: bank_account_number || null,
        contact_number: contactNumber,
        province_id: province_id || null,
        province_name: province_name || null,
        city_id: city_id || null,
        city_name: city_name || null,
        district_id: district_id || null,
        district_name: district_name || null,
        village_id: village_id || null,
        village_name: village_name || null,
        address: address || null,
        google_maps_link: google_maps_link || null,
    };

    const { error: insertError } = await supabase
        .from('businesses')
        .insert([businessPayload]);

    if (insertError) {
        if (insertError.code === '23505' || insertError.message.includes('slug')) {
            const fallbackSlug = `${slug}-${Date.now().toString().slice(-4)}`;
            const { error: retryError } = await supabase
                .from('businesses')
                .insert([{ ...businessPayload, slug: fallbackSlug }]);

            if (retryError) {
                return { error: `Gagal mendaftarkan toko: ${retryError.message}` };
            }
        } else {
            return { error: `Gagal mendaftarkan toko: ${insertError.message}` };
        }
    }

    // 6. Update tabel profiles (set is_seller = true) dengan mekanisme retry & resilience terhadap transient fetch error
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    is_seller: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (!profileError) {
                break;
            } else {
                console.warn(`[registerBusiness] Profile update attempt ${attempt + 1} error:`, profileError.message);
            }
        } catch (err: any) {
            console.warn(`[registerBusiness] Profile update attempt ${attempt + 1} exception:`, err?.message || err);
        }
        await new Promise((res) => setTimeout(res, 300));
    }

    // 7. Revalidate cache dan redirect ke /dashboard
    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export interface UpdateBusinessInput {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    contact_number?: string;
    province_id?: string;
    province_name?: string;
    city_id?: string;
    city_name?: string;
    district_id?: string;
    district_name?: string;
    village_id?: string;
    village_name?: string;
    address?: string;
    google_maps_link?: string;
    logo_url?: string;
    banner_url?: string;
    qris_image_url?: string;
    bank_name?: string;
    bank_account_number?: string;
}

/**
 * Server Action untuk Mengupdate Pengaturan Profil Toko (Businesses)
 */
export async function updateBusinessSettings(input: UpdateBusinessInput): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { error: 'Anda harus login terlebih dahulu untuk mengubah pengaturan toko.' };
        }

        if (!input.name || !input.name.trim()) {
            return { error: 'Nama toko tidak boleh kosong.' };
        }

        const updatePayload: Record<string, any> = {
            name: input.name.trim(),
            description: input.description?.trim() || null,
            contact_number: input.contact_number?.trim() || null,
            province_id: input.province_id?.trim() || null,
            province_name: input.province_name?.trim() || null,
            city_id: input.city_id?.trim() || null,
            city_name: input.city_name?.trim() || null,
            district_id: input.district_id?.trim() || null,
            district_name: input.district_name?.trim() || null,
            village_id: input.village_id?.trim() || null,
            village_name: input.village_name?.trim() || null,
            address: input.address?.trim() || null,
            google_maps_link: input.google_maps_link?.trim() || null,
            logo_url: input.logo_url || null,
            banner_url: input.banner_url || null,
            qris_image_url: input.qris_image_url || null,
            bank_name: input.bank_name?.trim() || null,
            bank_account_number: input.bank_account_number?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const { data: updatedRows, error: updateError } = await supabase
            .from('businesses')
            .update(updatePayload)
            .eq('id', input.id)
            .eq('owner_id', user.id)
            .select();

        if (updateError) {
            console.error('[updateBusinessSettings Error]:', updateError);
            return { error: `Gagal memperbarui profil toko: ${updateError.message}` };
        }

        if (updatedRows && updatedRows.length > 0) {
            const updatedSlug = updatedRows[0].slug;
            if (updatedSlug) {
                try {
                    await redis.del(`store:profile:${updatedSlug}`);
                } catch (cacheDelErr) {
                    console.warn(`[Redis Warn] Failed to invalidate cache for store:profile:${updatedSlug}:`, cacheDelErr);
                }
            }
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (err: any) {
        console.error('[updateBusinessSettings Exception]:', err);
        return { error: err.message || 'Terjadi kesalahan sistem saat memperbarui profil toko.' };
    }
}

/**
 * Server Action / Helper untuk mengambil data detail profil toko (business) berdasarkan slug
 * Menggunakan Upstash Redis Caching (pola Cache-Aside) dengan key `store:profile:${slug}` & TTL 24 Jam ({ ex: 86400 })
 * Dilengkapi Graceful Degradation (fallback otomatis ke Supabase jika Redis mengalami kendala/timeout)
 */
export async function getBusinessBySlug(slug: string) {
    if (!slug || typeof slug !== 'string') return null;

    const cacheKey = `store:profile:${slug.trim()}`;

    // 1. Cek Redis terlebih dahulu (Cache Hit)
    try {
        const cachedBusiness = await redis.get(cacheKey);
        if (cachedBusiness) {
            return cachedBusiness as any;
        }
    } catch (err) {
        console.error(`[Redis Error] Failed to get cache for key "${cacheKey}":`, err);
        // Fallback langsung ke Supabase (Graceful degradation)
    }

    // 2. Cache Miss: Jalankan query Supabase ke tabel businesses berdasarkan parameter slug
    try {
        const supabase = await createClient();
        const { data: business, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('slug', slug.trim())
            .maybeSingle();

        if (error || !business) {
            return null;
        }

        // 3. Simpan hasil query ke Redis dengan TTL 24 Jam ({ ex: 86400 })
        try {
            await redis.set(cacheKey, business, { ex: 86400 });
        } catch (setErr) {
            console.error(`[Redis Error] Failed to set cache for key "${cacheKey}":`, setErr);
        }

        return business;
    } catch (dbErr) {
        console.error(`[DB Error] Failed to fetch business for slug "${slug}":`, dbErr);
        return null;
    }
}

