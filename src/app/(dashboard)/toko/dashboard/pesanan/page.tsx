import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SellerOrdersClientView from './SellerOrdersClientView';

interface PageProps {
    searchParams: Promise<{
        highlight?: string;
    }>;
}

export default async function TokoDashboardPesananPage({ searchParams }: PageProps) {
    const { highlight } = await searchParams;
    const supabase = await createClient();

    // 1. Cek User Authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Ambil data bisnis milik user penjual yang sedang login
    const { data: business } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle();

    if (!business) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🏬</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Toko Belum Terdaftar</h1>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Anda belum mendaftarkan toko bisnis. Silakan buka toko terlebih dahulu untuk melihat dashboard manajemen pesanan.
                    </p>
                </div>
            </div>
        );
    }

    // 3. Fetch data semua pesanan bisnis (orders) beserta relasi ke profiles & order_items
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles (
                full_name,
                phone_number
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
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching seller orders:', error);
    }

    return (
        <SellerOrdersClientView
            orders={orders || []}
            businessName={business.name}
            highlight={highlight}
        />
    );
}
