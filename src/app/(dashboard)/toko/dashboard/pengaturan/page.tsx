import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PengaturanTokoClientView from './PengaturanTokoClientView';

export const metadata = {
    title: 'Pengaturan Toko | LORA Seller Centre',
    description: 'Kelola identitas toko, deskripsi, alamat, kontak WhatsApp, dan metode pembayaran digital UMKM Anda.',
};

export default async function PengaturanTokoPage() {
    const supabase = await createClient();

    // 1. Verifikasi Autentikasi User Penjual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. Data Fetching (Pre-fill): Ambil data toko dari tabel businesses berdasarkan ID penjual
    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

    // Jika penjual belum mendaftarkan toko, arahkan ke pendaftaran toko
    if (!business) {
        redirect('/buka-toko');
    }

    return <PengaturanTokoClientView business={business} />;
}
