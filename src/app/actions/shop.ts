'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type RegisterShopState = {
    error?: string;
} | null;

/**
 * Server Action untuk mendaftarkan Toko UMKM baru
 * - Mengambil pengguna aktif dari supabase.auth.getUser()
 * - Menyimpan data toko ke tabel shops (dengan fallback ke businesses)
 * - Mengubah status `is_seller` menjadi true pada tabel profiles
 * - Memperbarui cache (revalidatePath) dan mere-redirect pengguna ke /dashboard
 */
export async function registerShop(prevState: RegisterShopState, formData: FormData): Promise<RegisterShopState> {
    const supabase = await createClient();

    // 1. Verifikasi Sesi Pengguna Aktif
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Anda harus masuk (login) terlebih dahulu untuk mendaftarkan toko UMKM.' };
    }

    // 1b. Cek jika pengguna sudah memiliki toko (mencegah duplicate insert error)
    const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

    if (existingBusiness) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const { error: syncError } = await supabase
                    .from('profiles')
                    .update({ is_seller: true, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                if (!syncError) break;
            } catch (e) {
                console.warn(`[registerShop] Existing sync attempt ${attempt + 1} error:`, e);
            }
            await new Promise((res) => setTimeout(res, 200));
        }
        revalidatePath('/', 'layout');
        redirect('/dashboard');
    }

    // 2. Ekstrak & Validasi Input Form
    const shopName = (formData.get('shopName') as string || formData.get('name') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();

    if (!shopName) {
        return { error: 'Nama Toko UMKM wajib diisi.' };
    }

    // Generate Slug Unik untuk URL Toko
    const slug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    // 3. Simpan Data Toko ke Database (Dukungan Tabel 'shops' & 'businesses')
    let shopInsertError: string | null = null;

    const { error: shopsErr } = await supabase.from('shops').insert([
        {
            owner_id: user.id,
            name: shopName,
            slug: slug,
            description: description || null,
        }
    ]);

    if (shopsErr) {
        // Fallback ke tabel 'businesses' jika 'shops' tidak tersedia
        const { error: businessesErr } = await supabase.from('businesses').insert([
            {
                owner_id: user.id,
                name: shopName,
                slug: slug,
                description: description || null,
            }
        ]);

        if (businessesErr) {
            shopInsertError = businessesErr.message;
        }
    }

    if (shopInsertError) {
        return { error: `Gagal menyimpan data toko: ${shopInsertError}` };
    }

    // 4. Perbarui Status Profile is_seller menjadi true dengan retry & resilience
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_seller: true, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (!profileError) {
                break;
            } else {
                console.warn(`[registerShop] Profile update attempt ${attempt + 1} error:`, profileError.message);
            }
        } catch (err: any) {
            console.warn(`[registerShop] Profile update attempt ${attempt + 1} exception:`, err?.message || err);
        }
        await new Promise((res) => setTimeout(res, 300));
    }

    // 5. Revalidasi & Redirect ke Dashboard Penjual
    revalidatePath('/', 'layout');
    redirect('/dashboard');
}
