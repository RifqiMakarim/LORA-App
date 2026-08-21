import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateRFMSegmentation, CustomerOrderData } from '@/lib/engines/rfm-engine';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Fallback Mock Data jika tidak ada user terautentikasi (Demo Preview Mode)
    if (authError || !user) {
      return NextResponse.json(getDemoRFMSummary());
    }

    // 1. Cari bisnis milik owner ini
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (businessError || !business) {
      // Jika user belum membuat toko, kembalikan summary demo
      return NextResponse.json(getDemoRFMSummary());
    }

    // 2. Fetch transaksi dengan customer terdaftar (customer_id NOT NULL) beserta order_items
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        total_amount,
        order_status,
        payment_status,
        created_at,
        profiles:customer_id (
          id,
          full_name,
          phone_number,
          avatar_url
        ),
        order_items (
          id,
          quantity,
          price_per_item,
          products:product_id (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('business_id', business.id)
      .not('customer_id', 'is', null)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching customer orders for RFM:', ordersError);
      return NextResponse.json({ error: 'Gagal mengambil data pelanggan' }, { status: 500 });
    }

    if (!ordersData || ordersData.length === 0) {
      return NextResponse.json(getDemoRFMSummary());
    }

    // 3. Kelompokkan order per customer_id
    const customerMap = new Map<string, CustomerOrderData>();

    ordersData.forEach((order: any) => {
      const profile = order.profiles;
      if (!profile || !order.customer_id) return;

      if (!customerMap.has(order.customer_id)) {
        customerMap.set(order.customer_id, {
          customer_id: order.customer_id,
          full_name: profile.full_name || 'Pembeli LORA',
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
          orders: [],
        });
      }

      const existing = customerMap.get(order.customer_id)!;
      
      // Parse items
      const items = (order.order_items || []).map((item: any) => ({
        id: item.id,
        product_name: item.products?.name || 'Produk UMKM',
        quantity: item.quantity || 1,
        price_per_item: Number(item.price_per_item || 0),
        image_url: item.products?.image_url || null,
      }));

      existing.orders.push({
        id: order.id,
        total_amount: Number(order.total_amount || 0),
        created_at: order.created_at,
        order_status: order.order_status || 'completed',
        payment_status: order.payment_status || 'paid',
        items,
      });
    });

    const rawCustomerList = Array.from(customerMap.values());
    const rfmSummary = calculateRFMSegmentation(rawCustomerList);

    return NextResponse.json(rfmSummary);

  } catch (error) {
    console.error('Unexpected error in Customer RFM API:', error);
    return NextResponse.json(getDemoRFMSummary());
  }
}

/**
 * Data Simulasi / Fallback Demo UMKM DIY-Jateng
 */
function getDemoRFMSummary() {
  const demoRawData: CustomerOrderData[] = [
    {
      customer_id: 'cust-1',
      full_name: 'Budi Santoso',
      phone_number: '6281234567890',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      orders: [
        { 
          id: 'o-1', 
          total_amount: 450000, 
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-1', product_name: 'Kain Batik Tulis Sogan Premium', quantity: 1, price_per_item: 350000 },
            { id: 'i-2', product_name: 'Masker Batik Katun Primis', quantity: 2, price_per_item: 50000 }
          ]
        },
        { 
          id: 'o-2', 
          total_amount: 320000, 
          created_at: new Date(Date.now() - 15 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-3', product_name: 'Kemeja Pria Batik Parang Garudo', quantity: 1, price_per_item: 320000 }
          ]
        },
        { 
          id: 'o-3', 
          total_amount: 550000, 
          created_at: new Date(Date.now() - 28 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-4', product_name: 'Blus Wanita Batik Cap Madura', quantity: 2, price_per_item: 275000 }
          ]
        },
        { 
          id: 'o-4', 
          total_amount: 600000, 
          created_at: new Date(Date.now() - 40 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-5', product_name: 'Kain Jarik Pengantin Tradisional', quantity: 2, price_per_item: 300000 }
          ]
        }
      ]
    },
    {
      customer_id: 'cust-2',
      full_name: 'Siti Rahmawati',
      phone_number: '6281987654321',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      orders: [
        { 
          id: 'o-5', 
          total_amount: 280000, 
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-6', product_name: 'Outer Batik Cap Motif Kawung', quantity: 1, price_per_item: 280000 }
          ]
        },
        { 
          id: 'o-6', 
          total_amount: 310000, 
          created_at: new Date(Date.now() - 20 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-7', product_name: 'Rok Lilit Batik Jumputan Asli Solo', quantity: 1, price_per_item: 310000 }
          ]
        },
        { 
          id: 'o-7', 
          total_amount: 250000, 
          created_at: new Date(Date.now() - 45 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-8', product_name: 'Syal Sutra Batik Pekalongan', quantity: 1, price_per_item: 250000 }
          ]
        }
      ]
    },
    {
      customer_id: 'cust-3',
      full_name: 'Agus Wijaya',
      phone_number: '6285711223344',
      avatar_url: null,
      orders: [
        { 
          id: 'o-8', 
          total_amount: 150000, 
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-9', product_name: 'Dompet Pria Kulit Kombinasi Batik', quantity: 1, price_per_item: 150000 }
          ]
        }
      ]
    },
    {
      customer_id: 'cust-4',
      full_name: 'Dewi Lestari',
      phone_number: '6281399887766',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
      orders: [
        { 
          id: 'o-9', 
          total_amount: 520000, 
          created_at: new Date(Date.now() - 60 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-10', product_name: 'Set Gamis Batik Lurik Modern', quantity: 1, price_per_item: 520000 }
          ]
        },
        { 
          id: 'o-10', 
          total_amount: 480000, 
          created_at: new Date(Date.now() - 75 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-11', product_name: 'Tas Jinjing Etnik Anyaman Pandan', quantity: 2, price_per_item: 240000 }
          ]
        }
      ]
    },
    {
      customer_id: 'cust-5',
      full_name: 'Eko Prasetyo',
      phone_number: '6287855443322',
      avatar_url: null,
      orders: [
        { 
          id: 'o-11', 
          total_amount: 85000, 
          created_at: new Date(Date.now() - 90 * 86400000).toISOString(), 
          order_status: 'completed', 
          payment_status: 'paid',
          items: [
            { id: 'i-12', product_name: 'Pouch Souvenir Batik Tulis Khas Jogja', quantity: 1, price_per_item: 85000 }
          ]
        }
      ]
    }
  ];

  return calculateRFMSegmentation(demoRawData);
}
