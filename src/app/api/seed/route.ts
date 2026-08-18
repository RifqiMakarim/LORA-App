import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/seed
 * 
 * Endpoint untuk mengisi database Supabase dengan data dummy 2 akun UMKM:
 * - Akun A: "Batik Kencana Jogja" (60 hari transaksi — Holt-Winters High Confidence)
 * - Akun B: "Bakpia Pathok Sekar DIY" (5 hari transaksi — Cold-Start Low Confidence)
 * 
 * PERINGATAN: Hanya untuk development/demo! Jangan panggil di production.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string = user?.id || '00000000-0000-0000-0000-000000000001';

    // WAJIB: Pastikan profile untuk userId ini sudah ada di public.profiles
    // agar tidak melanggar foreign key constraint "businesses_owner_id_fkey"!
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: user?.user_metadata?.full_name || 'Penjual LORA (Demo)',
      phone_number: '6281234567890',
      is_seller: true,
      is_buyer: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileErr) {
      console.warn('Seed profile upsert warning:', profileErr.message);
    }

    const results: string[] = [];

    // =========================================================================
    // SEED TABEL local_events (Master Data Event Kebudayaan DIY & Jateng)
    // =========================================================================
    const { error: eventsError } = await supabase.from('local_events').upsert([
      {
        title: 'Dieng Culture Festival (DCF) 2026',
        province_name: 'Jawa Tengah',
        city_name: 'Kabupaten Banjarnegara',
        start_date: '2026-08-20',
        end_date: '2026-08-23',
        description: 'Festival budaya pemotongan rambut gimbal dan pementasan seni di dataran tinggi Dieng.',
        expected_tourist_impact: 'massive',
      },
      {
        title: 'Upacara Adat Sekaten Yogyakarta 2026',
        province_name: 'DI Yogyakarta',
        city_name: 'Kota Yogyakarta',
        start_date: '2026-09-15',
        end_date: '2026-09-22',
        description: 'Perayaan tahunan Pasar Malam Sekaten di Alun-alun Utara Yogyakarta.',
        expected_tourist_impact: 'massive',
      },
      {
        title: 'Solo Batik Carnival 2026',
        province_name: 'Jawa Tengah',
        city_name: 'Kota Surakarta',
        start_date: '2026-10-02',
        end_date: '2026-10-04',
        description: 'Karnaval megah memperingati Hari Batik Nasional di Jalan Slamet Riyadi Solo.',
        expected_tourist_impact: 'high',
      },
    ], { onConflict: 'id', ignoreDuplicates: true });

    if (eventsError) {
      console.warn('Seed local_events warning:', eventsError.message);
    } else {
      results.push('✅ local_events: 3 event daerah DIY-Jateng berhasil di-seed.');
    }

    // =========================================================================
    // AKUN A: Batik Kencana Jogja (UMKM Matang — 60 Hari Data)
    // =========================================================================

    // 1. Buat Business A
    const { data: bizA, error: bizAErr } = await supabase.from('businesses').upsert({
      owner_id: userId,
      name: 'Batik Kencana Jogja',
      slug: 'batik-kencana-jogja',
      description: 'Pusat batik tulis premium motif klasik Keraton Yogyakarta. Menyediakan kain, kemeja, dan aksesori batik berkualitas tinggi.',
      province_name: 'DI Yogyakarta',
      city_name: 'Kota Yogyakarta',
      district_name: 'Gondomanan',
      village_name: 'Ngupasan',
      contact_number: '6281234567890',
    }, { onConflict: 'slug' }).select().single();

    if (bizAErr) {
      return NextResponse.json({ error: `Gagal membuat Business A: ${bizAErr.message}` }, { status: 500 });
    }
    results.push(`✅ Business A "${bizA.name}" berhasil dibuat (id: ${bizA.id}).`);

    // 2. Produk Akun A (10 Produk Batik)
    const productsA = [
      { business_id: bizA.id, name: 'Kain Batik Tulis Parang', category: 'Batik', price: 450000, stock: 25, description: 'Motif klasik Parang Rusak, pewarna alami.' },
      { business_id: bizA.id, name: 'Kemeja Batik Sogan Pria', category: 'Batik', price: 320000, stock: 40, description: 'Kemeja batik sogan lengan panjang khas Solo-Jogja.' },
      { business_id: bizA.id, name: 'Kain Batik Cap Mega Mendung', category: 'Batik', price: 180000, stock: 60, description: 'Motif Mega Mendung khas Cirebon-Jawa Tengah.' },
      { business_id: bizA.id, name: 'Blouse Batik Wanita Kawung', category: 'Batik', price: 275000, stock: 35, description: 'Blouse batik motif Kawung modern untuk wanita.' },
      { business_id: bizA.id, name: 'Dompet Batik Kulit Asli', category: 'Aksesori', price: 150000, stock: 50, description: 'Dompet kulit kombinasi kain batik handmade.' },
      { business_id: bizA.id, name: 'Tas Tote Bag Batik', category: 'Aksesori', price: 125000, stock: 45, description: 'Tote bag kanvas dengan aksen batik tulis.' },
      { business_id: bizA.id, name: 'Syal Batik Sutra', category: 'Aksesori', price: 200000, stock: 30, description: 'Syal sutra premium dengan motif batik kontemporer.' },
      { business_id: bizA.id, name: 'Kipas Batik Kayu Jati', category: 'Kerajinan', price: 85000, stock: 70, description: 'Kipas tangan kayu jati dengan lukisan batik.' },
      { business_id: bizA.id, name: 'Set Masker Batik (3 pcs)', category: 'Aksesori', price: 65000, stock: 100, description: 'Masker kain batik 3 lapis isi 3 motif.' },
      { business_id: bizA.id, name: 'Sarung Batik Tulis Premium', category: 'Batik', price: 550000, stock: 15, description: 'Sarung batik tulis tangan motif Sido Luhur.' },
    ];

    const { error: prodAErr } = await supabase.from('products').upsert(productsA, { onConflict: 'id', ignoreDuplicates: true });
    if (prodAErr) console.warn('Seed products A warning:', prodAErr.message);
    else results.push('✅ Products A: 10 produk batik berhasil di-seed.');

    // Ambil product IDs untuk order_items
    const { data: productsAData } = await supabase.from('products').select('id, price').eq('business_id', bizA.id);

    // 3. Pembeli Terdaftar (15 profil dummy via auth.admin — kita simulasi dengan INSERT langsung)
    //    Karena profiles terikat auth.users, kita buat orders tanpa customer_id untuk seed forecast,
    //    dan buat orders DENGAN customer_id = user.id (owner sendiri beli) untuk seed RFM.
    const buyerNames = [
      'Budi Santoso', 'Siti Rahmawati', 'Agus Wijaya', 'Dewi Lestari', 'Eko Prasetyo',
      'Rina Kartika', 'Hendra Gunawan', 'Mega Putri', 'Fajar Nugroho', 'Yuni Astuti',
      'Wahyu Firmansyah', 'Lina Marlina', 'Dimas Prayoga', 'Anisa Fadilah', 'Riko Aditya',
    ];

    // 4. Generate 60 hari transaksi harian untuk Akun A
    const today = new Date();
    const ordersA: {
      business_id: string;
      customer_id: string | null;
      total_amount: number;
      order_status: string;
      payment_status: string;
      created_at: string;
    }[] = [];

    for (let dayOffset = 60; dayOffset >= 1; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - dayOffset);
      const dayOfWeek = orderDate.getDay(); // 0=Minggu, 6=Sabtu

      // Pola musiman: Weekend (Sabtu-Minggu) lebih ramai
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseOrderCount = isWeekend ? 3 : 1; // 2-4 order di weekend, 1-2 di weekday
      const extraOrders = Math.floor(Math.random() * 2);
      const dailyOrderCount = baseOrderCount + extraOrders;

      for (let j = 0; j < dailyOrderCount; j++) {
        // Pilih produk random
        const randomProduct = productsAData
          ? productsAData[Math.floor(Math.random() * productsAData.length)]
          : null;
        const basePrice = randomProduct ? Number(randomProduct.price) : 300000;
        const quantity = 1 + Math.floor(Math.random() * 3);
        const totalAmount = basePrice * quantity;

        // Assign customer_id = user.id (owner sendiri sebagai pembeli demo untuk RFM)
        const useOwnerId = Math.random() > 0.3; // 70% pakai owner id

        // Buat waktu acak dalam hari itu
        const hours = 8 + Math.floor(Math.random() * 12); // 08:00 - 20:00
        const minutes = Math.floor(Math.random() * 60);
        orderDate.setHours(hours, minutes, 0, 0);

        ordersA.push({
          business_id: bizA.id,
          customer_id: useOwnerId ? userId : null,
          total_amount: totalAmount,
          order_status: 'completed',
          payment_status: 'paid',
          created_at: orderDate.toISOString(),
        });
      }
    }

    // Insert orders dalam batch
    const BATCH_SIZE = 50;
    let insertedOrdersA = 0;
    for (let i = 0; i < ordersA.length; i += BATCH_SIZE) {
      const batch = ordersA.slice(i, i + BATCH_SIZE);
      const { error: ordAErr } = await supabase.from('orders').insert(batch);
      if (ordAErr) {
        console.warn(`Seed orders A batch ${i} warning:`, ordAErr.message);
      } else {
        insertedOrdersA += batch.length;
      }
    }
    results.push(`✅ Orders A: ${insertedOrdersA} transaksi (60 hari harian) berhasil di-seed.`);

    // =========================================================================
    // AKUN B: Bakpia Pathok Sekar DIY (UMKM Baru — 5 Hari Data)
    // =========================================================================

    const { data: bizB, error: bizBErr } = await supabase.from('businesses').upsert({
      owner_id: userId,
      name: 'Bakpia Pathok Sekar DIY',
      slug: 'bakpia-pathok-sekar-diy',
      description: 'Bakpia isi kacang hijau, coklat, dan keju khas Pathok Yogyakarta. Oleh-oleh favorit wisatawan.',
      province_name: 'DI Yogyakarta',
      city_name: 'Kota Yogyakarta',
      district_name: 'Ngampilan',
      village_name: 'Ngampilan',
      contact_number: '6289876543210',
    }, { onConflict: 'slug' }).select().single();

    if (bizBErr) {
      return NextResponse.json({ error: `Gagal membuat Business B: ${bizBErr.message}` }, { status: 500 });
    }
    results.push(`✅ Business B "${bizB.name}" berhasil dibuat (id: ${bizB.id}).`);

    // Produk Akun B (5 Produk Kuliner)
    const productsB = [
      { business_id: bizB.id, name: 'Bakpia Kacang Hijau Isi 20', category: 'Kuliner', price: 45000, stock: 100, description: 'Bakpia original kacang hijau isi 20 buah.' },
      { business_id: bizB.id, name: 'Bakpia Coklat Isi 20', category: 'Kuliner', price: 50000, stock: 80, description: 'Bakpia rasa coklat premium isi 20 buah.' },
      { business_id: bizB.id, name: 'Bakpia Keju Isi 20', category: 'Kuliner', price: 55000, stock: 60, description: 'Bakpia rasa keju lumer isi 20 buah.' },
      { business_id: bizB.id, name: 'Paket Hampers 3 Rasa', category: 'Kuliner', price: 135000, stock: 30, description: 'Gift box berisi 3 kotak bakpia (kacang hijau, coklat, keju).' },
      { business_id: bizB.id, name: 'Bakpia Mini Camilan Isi 30', category: 'Kuliner', price: 35000, stock: 120, description: 'Bakpia mini cemilan rasa original isi 30 buah.' },
    ];

    const { error: prodBErr } = await supabase.from('products').upsert(productsB, { onConflict: 'id', ignoreDuplicates: true });
    if (prodBErr) console.warn('Seed products B warning:', prodBErr.message);
    else results.push('✅ Products B: 5 produk kuliner berhasil di-seed.');

    const { data: productsBData } = await supabase.from('products').select('id, price').eq('business_id', bizB.id);

    // Generate 5 hari transaksi untuk Akun B (Cold-Start)
    const ordersB: typeof ordersA = [];

    for (let dayOffset = 5; dayOffset >= 1; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - dayOffset);

      const dailyOrderCount = 1 + Math.floor(Math.random() * 2); // 1-2 order per hari

      for (let j = 0; j < dailyOrderCount; j++) {
        const randomProduct = productsBData
          ? productsBData[Math.floor(Math.random() * productsBData.length)]
          : null;
        const basePrice = randomProduct ? Number(randomProduct.price) : 50000;
        const quantity = 1 + Math.floor(Math.random() * 5);
        const totalAmount = basePrice * quantity;

        const hours = 9 + Math.floor(Math.random() * 10);
        const minutes = Math.floor(Math.random() * 60);
        orderDate.setHours(hours, minutes, 0, 0);

        ordersB.push({
          business_id: bizB.id,
          customer_id: userId,
          total_amount: totalAmount,
          order_status: 'completed',
          payment_status: 'paid',
          created_at: orderDate.toISOString(),
        });
      }
    }

    const { error: ordBErr } = await supabase.from('orders').insert(ordersB);
    if (ordBErr) {
      console.warn('Seed orders B warning:', ordBErr.message);
    } else {
      results.push(`✅ Orders B: ${ordersB.length} transaksi (5 hari) berhasil di-seed.`);
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    return NextResponse.json({
      success: true,
      message: 'Seed data dual-account berhasil di-generate!',
      details: results,
      accounts: {
        accountA: {
          name: bizA.name,
          id: bizA.id,
          slug: bizA.slug,
          orders_count: insertedOrdersA,
          data_days: 60,
          expected_confidence: 'high',
          expected_model: 'Holt-Winters Triple Exponential Smoothing',
        },
        accountB: {
          name: bizB.name,
          id: bizB.id,
          slug: bizB.slug,
          orders_count: ordersB.length,
          data_days: 5,
          expected_confidence: 'low',
          expected_model: 'Simple Moving Average Fallback',
        },
      },
    });

  } catch (error) {
    console.error('Unexpected error in Seed API:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Gagal menjalankan seed data: ${errMsg}` }, { status: 500 });
  }
}
