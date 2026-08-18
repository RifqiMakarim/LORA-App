'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface UpdateProfileInput {
    fullName: string;
    phone?: string | null;
    avatarUrl?: string | null;
}

/**
 * Server Action untuk memperbarui profil pengguna di tabel `profiles`
 * Menangani update dan insert (fallback) dengan RLS & sesi server-side aman
 */
export async function updateProfile(input: UpdateProfileInput) {
    const supabase = await createClient();

    // 1. Verifikasi Sesi Server-Side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Sesi pengguna tidak ditemukan. Silakan login kembali.' };
    }

    const fullNameTrimmed = input.fullName.trim();
    if (!fullNameTrimmed) {
        return { error: 'Nama lengkap tidak boleh kosong.' };
    }

    // 2. Cek apakah profil pengguna sudah ada di tabel profiles
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    if (existingProfile) {
        // Melakukan UPDATE baris profil yang sudah ada
        const { error: updateErr } = await supabase
            .from('profiles')
            .update({
                full_name: fullNameTrimmed,
                phone_number: input.phone ? input.phone.trim() : null,
                avatar_url: input.avatarUrl || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateErr) {
            console.error('Error update profile:', updateErr);
            return { error: updateErr.message };
        }
    } else {
        // Melakukan INSERT jika baris profil belum pernah dibuat sebelumnya
        const { error: insertErr } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: fullNameTrimmed,
                phone_number: input.phone ? input.phone.trim() : null,
                avatar_url: input.avatarUrl || null,
                is_buyer: true,
                is_seller: false,
                updated_at: new Date().toISOString(),
            });

        if (insertErr) {
            console.error('Error insert profile:', insertErr);
            return { error: insertErr.message };
        }
    }

    revalidatePath('/akun');
    revalidatePath('/', 'layout');
    return { success: true };
}
