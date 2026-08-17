import { createClient } from '@/lib/supabase/server';
import KelolaPesananClientView from './KelolaPesananClientView';

interface PageProps {
    searchParams: Promise<{
        id?: string;
        token?: string;
    }>;
}

export default async function KelolaPesananPage({ searchParams }: PageProps) {
    const { id, token } = await searchParams;

    // Validasi Awal: id dan token harus ada
    if (!id || !token) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-slate-200">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Akses Ditolak</h1>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Tautan tidak valid atau pesanan tidak ditemukan.
                    </p>
                </div>
            </div>
        );
    }

    const supabase = await createClient();

    // Data Fetching: Ambil data pesanan dari Supabase
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
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
            ),
            profiles (
                full_name,
                phone_number
            )
        `)
        .eq('id', id)
        .eq('wa_token', token)
        .maybeSingle();

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-slate-200">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Pesanan Tidak Ditemukan</h1>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Tautan tidak valid atau pesanan tidak ditemukan.
                    </p>
                </div>
            </div>
        );
    }

    return <KelolaPesananClientView order={order} id={id} token={token} />;
}
