import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import UserOrdersClientView from './UserOrdersClientView';

export const metadata: Metadata = {
    title: 'Riwayat Pesanan Saya - LORA',
    description: 'Daftar transaksi dan status pesanan belanja Anda di toko UMKM LORA.',
};

/**
 * Server Component Halaman Riwayat Pesanan Pembeli (/user/pesanan)
 * Terproteksi Server-Side via Supabase Auth
 */
export default async function UserPesananPage() {
    const supabase = await createClient();

    // 1. Verifikasi Autentikasi User Server-Side
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Data Pesanan Pembeli (orders)
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            businesses (
                id,
                name,
                slug,
                qris_image_url,
                bank_name,
                bank_account_number
            ),
            order_items (
                id,
                quantity,
                price_per_item,
                product_id,
                products (
                    id,
                    name,
                    image_url
                )
            )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
    }

    return <UserOrdersClientView orders={orders || []} />;
}
