import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface NotificationItem {
  id: string;
  type: 'inventory_out' | 'inventory_rop' | 'inventory_overstock' | 'order_pending' | 'event_upcoming';
  severity: 'danger' | 'warning' | 'info' | 'primary';
  category: 'inventory' | 'orders' | 'events';
  title: string;
  message: string;
  link: string;
  created_at: string;
  data?: Record<string, any>;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Ambil data Toko & Profil User
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, province_name, city_name')
      .eq('owner_id', user.id)
      .maybeSingle();

    const notifications: NotificationItem[] = [];

    // Jika user memiliki toko aktif (Seller):
    if (business) {
      // A. Alert Inventaris (Stok Habis & Stok di bawah ROP)
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock, min_stock, price, is_active')
        .eq('business_id', business.id)
        .eq('is_active', true);

      if (products && products.length > 0) {
        products.forEach((p) => {
          const minStock = Number(p.min_stock || 10);
          const stock = Number(p.stock || 0);

          if (stock <= 0) {
            notifications.push({
              id: `inv-out-${p.id}`,
              type: 'inventory_out',
              severity: 'danger',
              category: 'inventory',
              title: `Stok Habis: ${p.name}`,
              message: `Stok produk ini kosong (0 item). Segera lakukan pengadaan ulang agar etalase toko tetap aktif.`,
              link: '/dashboard/inventory',
              created_at: new Date().toISOString(),
              data: { productId: p.id, stock, minStock },
            });
          } else if (stock <= minStock) {
            notifications.push({
              id: `inv-rop-${p.id}`,
              type: 'inventory_rop',
              severity: 'warning',
              category: 'inventory',
              title: `Stok Kritis (Batas ROP): ${p.name}`,
              message: `Sisa stok ${stock} unit (Batas aman ROP: ${minStock} unit). Pesan ulang ke supplier untuk mencegah kehabisan stok.`,
              link: '/dashboard/inventory',
              created_at: new Date().toISOString(),
              data: { productId: p.id, stock, minStock },
            });
          }
        });
      }

      // B. Alert Pesanan Menunggu Validasi / Diproses
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id, short_id, total_amount, order_status, payment_status, payment_method, created_at, profiles(full_name)')
        .eq('business_id', business.id)
        .in('order_status', ['verifying', 'pending'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingOrders && pendingOrders.length > 0) {
        pendingOrders.forEach((o) => {
          const buyerName = (o.profiles as any)?.full_name || 'Pembeli';
          const shortCode = o.short_id || o.id.slice(0, 8);
          const totalRp = Number(o.total_amount || 0).toLocaleString('id-ID');

          notifications.push({
            id: `order-pending-${o.id}`,
            type: 'order_pending',
            severity: 'info',
            category: 'orders',
            title: `Pesanan Baru: #${shortCode}`,
            message: `Pesanan dari ${buyerName} sebesar Rp ${totalRp} (${o.payment_method?.toUpperCase()}) menunggu untuk diproses.`,
            link: `/dashboard/pesanan?highlight=${o.id}`,
            created_at: o.created_at,
            data: { orderId: o.id, amount: o.total_amount },
          });
        });
      }

      // C. Alert Event Regional DIY & Jateng Mendatang
      const now = new Date();
      const fourteenDaysAhead = new Date();
      fourteenDaysAhead.setDate(now.getDate() + 14);

      const { data: rawEvents } = await supabase
        .from('local_events')
        .select('id, title, province_name, city_name, start_date, end_date, expected_tourist_impact')
        .gte('end_date', now.toISOString().split('T')[0])
        .lte('start_date', fourteenDaysAhead.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(3);

      if (rawEvents && rawEvents.length > 0) {
        rawEvents.forEach((ev) => {
          const isSameProvince = business.province_name && ev.province_name.toLowerCase().includes(business.province_name.toLowerCase());
          
          if (isSameProvince) {
            notifications.push({
              id: `event-${ev.id}`,
              type: 'event_upcoming',
              severity: 'primary',
              category: 'events',
              title: `Event Daerah: ${ev.title}`,
              message: `Event wisata di ${ev.city_name ? ev.city_name + ', ' : ''}${ev.province_name} dimulai ${new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}. Potensi lonjakan wisatawan (${ev.expected_tourist_impact.toUpperCase()}).`,
              link: '/dashboard/events',
              created_at: new Date().toISOString(),
              data: { eventId: ev.id, impact: ev.expected_tourist_impact },
            });
          }
        });
      }
    }

    const inventoryCount = notifications.filter((n) => n.category === 'inventory').length;
    const ordersCount = notifications.filter((n) => n.category === 'orders').length;
    const eventsCount = notifications.filter((n) => n.category === 'events').length;

    return NextResponse.json({
      success: true,
      total: notifications.length,
      counts: {
        inventory: inventoryCount,
        orders: ordersCount,
        events: eventsCount,
      },
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Gagal memuat notifikasi' }, { status: 500 });
  }
}
