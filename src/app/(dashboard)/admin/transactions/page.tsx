import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AdminTransactionsClient, { AdminTransactionItem } from '@/components/dashboard/AdminTransactionsClient';

export const metadata: Metadata = {
  title: 'Riwayat Transaksi Platform | Admin LORA',
  description: 'Audit dan kelola seluruh riwayat transaksi perdagangan UMKM di platform LORA.',
};

export default async function AdminTransactionsPage() {
  const supabase = await createClient();

  // Fetch all orders with profiles, businesses, and order_items
  const { data: rawOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      short_id,
      total_amount,
      payment_method,
      payment_status,
      order_status,
      created_at,
      updated_at,
      profiles (
        id,
        full_name,
        phone_number
      ),
      businesses (
        id,
        name,
        slug,
        city_name,
        province_name,
        contact_number
      ),
      order_items (
        id,
        quantity,
        price_per_item,
        products (
          id,
          name,
          image_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin transactions:', error);
  }

  const transactions: AdminTransactionItem[] = (rawOrders || []).map((o) => {
    const rawItems = (o.order_items as any[]) || [];
    const items = rawItems.map((item) => ({
      id: item.id,
      quantity: Number(item.quantity || 1),
      pricePerItem: Number(item.price_per_item || 0),
      productName: item.products?.name || 'Produk UMKM',
      productImage: item.products?.image_url || null,
    }));

    const business = o.businesses as any;
    const profile = o.profiles as any;

    return {
      id: o.id,
      shortId: o.short_id || `ORD-${o.id.slice(0, 4).toUpperCase()}`,
      totalAmount: Number(o.total_amount || 0),
      paymentMethod: o.payment_method || 'qris',
      paymentStatus: o.payment_status || 'pending',
      orderStatus: o.order_status || 'pending',
      createdAt: o.created_at,
      customerName: profile?.full_name || 'Pelanggan LORA',
      customerPhone: profile?.phone_number || '-',
      businessName: business?.name || 'Toko UMKM',
      businessSlug: business?.slug || '',
      businessCity: business?.city_name || 'DIY & Jateng',
      businessProvince: business?.province_name || '',
      businessContact: business?.contact_number || '-',
      itemsCount: items.reduce((acc, it) => acc + it.quantity, 0) || items.length || 1,
      items,
    };
  });

  return <AdminTransactionsClient transactions={transactions} />;
}
