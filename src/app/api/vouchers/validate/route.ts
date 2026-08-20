import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { slug, code, cart_total = 0 } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Kode voucher tidak boleh kosong' }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ valid: false, message: 'Identitas toko (slug) tidak valid' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cartTotalNum = Number(cart_total) || 0;
    const now = new Date();

    const supabase = await createClient();

    // 1. Cari bisnis berdasarkan slug
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle();

    let voucher: any = null;

    if (business) {
      // 2. Cari voucher di database
      const { data: foundVoucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('business_id', business.id)
        .ilike('code', cleanCode)
        .maybeSingle();

      voucher = foundVoucher;
    }

    // 3. Fallback Simulasi / Demo System Voucher jika DB belum ada data
    if (!voucher) {
      if (cleanCode.startsWith('CHAMP') || cleanCode === 'VIP20') {
        voucher = {
          code: cleanCode,
          discount_type: 'percent',
          discount_value: 20,
          min_order_amount: 100000,
          usage_limit: 100,
          times_used: 0,
          is_active: true,
          starts_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        };
      } else if (cleanCode === 'KANGEN15' || cleanCode.startsWith('ATRIS')) {
        voucher = {
          code: cleanCode,
          discount_type: 'percent',
          discount_value: 15,
          min_order_amount: 50000,
          usage_limit: 100,
          times_used: 0,
          is_active: true,
          starts_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        };
      } else if (cleanCode.startsWith('POTEN') || cleanCode === 'DISKON10') {
        voucher = {
          code: cleanCode,
          discount_type: 'percent',
          discount_value: 10,
          min_order_amount: 0,
          usage_limit: 100,
          times_used: 0,
          is_active: true,
          starts_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        };
      } else {
        return NextResponse.json({
          valid: false,
          message: `Kode voucher "${cleanCode}" tidak ditemukan atau tidak berlaku di toko ini.`,
        }, { status: 404 });
      }
    }

    // 4. Validasi Status Aktif
    if (!voucher.is_active) {
      return NextResponse.json({
        valid: false,
        message: `Kupon "${cleanCode}" saat ini sedang dinonaktifkan oleh pemilik toko.`,
      }, { status: 400 });
    }

    // 5. Validasi Tanggal Mulai Aktif (starts_at)
    if (voucher.starts_at) {
      const startDate = new Date(voucher.starts_at);
      if (now < startDate) {
        const formattedStart = startDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return NextResponse.json({
          valid: false,
          message: `Kupon "${cleanCode}" baru dapat digunakan mulai tanggal ${formattedStart}.`,
        }, { status: 400 });
      }
    }

    // 6. Validasi Tanggal Kedaluwarsa (expires_at)
    if (voucher.expires_at) {
      const expireDate = new Date(voucher.expires_at);
      if (now > expireDate) {
        const formattedExpire = expireDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return NextResponse.json({
          valid: false,
          message: `Kupon "${cleanCode}" telah kedaluwarsa pada tanggal ${formattedExpire}.`,
        }, { status: 400 });
      }
    }

    // 7. Validasi Kuota Pemakaian
    if (voucher.usage_limit && (voucher.times_used || 0) >= voucher.usage_limit) {
      return NextResponse.json({
        valid: false,
        message: `Kuota pemakaian kupon "${cleanCode}" telah habis.`,
      }, { status: 400 });
    }

    // 8. Validasi Minimal Pembelian
    if (voucher.min_order_amount && cartTotalNum < Number(voucher.min_order_amount)) {
      const formattedMin = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(voucher.min_order_amount));
      return NextResponse.json({
        valid: false,
        message: `Minimal total belanja untuk kupon "${cleanCode}" adalah ${formattedMin}.`,
      }, { status: 400 });
    }

    // 9. Kalkulasi Potongan Harga
    let discountAmount = 0;
    if (voucher.discount_type === 'percent') {
      discountAmount = Math.round((cartTotalNum * Number(voucher.discount_value)) / 100);
    } else {
      discountAmount = Math.min(cartTotalNum, Number(voucher.discount_value));
    }

    const finalTotal = Math.max(0, cartTotalNum - discountAmount);

    return NextResponse.json({
      valid: true,
      message: `Voucher "${cleanCode}" berhasil diterapkan!`,
      voucher: {
        id: voucher.id,
        code: cleanCode,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        discount_amount: discountAmount,
        final_total: finalTotal,
        starts_at: voucher.starts_at,
        expires_at: voucher.expires_at,
      }
    });

  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json({ valid: false, message: 'Terjadi kesalahan sistem saat memvalidasi voucher' }, { status: 500 });
  }
}
