import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AccountSettingsForm from '@/components/storefront/AccountSettingsForm';

export const metadata: Metadata = {
    title: 'Pengaturan Akun - LORA Storefront',
    description: 'Kelola informasi data diri dan nomor kontak akun LORA Anda.',
};

/**
 * Server Component Halaman Pengaturan Akun (/akun)
 * Terproteksi Server-Side via Supabase Auth
 */
export default async function AkunPage() {
    const supabase = await createClient();

    // 1. Verifikasi Sesi Pengguna Server-Side (Proteksi Wajib Login)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // 2. Data Fetching Profil Pengguna dari tabel profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    return (
        <AccountSettingsForm
            user={{ id: user.id, email: user.email || '' }}
            initialProfile={profile}
        />
    );
}
