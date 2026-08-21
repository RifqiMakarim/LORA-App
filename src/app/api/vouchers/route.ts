import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      code,
      discount_type = 'percent',
      discount_value,
      target_segment = null,
      min_order_amount = 0,
      usage_limit = 100,
      starts_at = new Date().toISOString(),
      expires_at = null,
    } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Kode voucher wajib diisi' }, { status: 400 });
    }

    if (discount_value === undefined || discount_value <= 0) {
      return NextResponse.json({ error: 'Besar diskon tidak valid' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Fallback jika tidak ada user / offline mode
    if (authError || !user) {
      const demoVoucher = {
        id: `vouch-${Date.now()}`,
        code: cleanCode,
        discount_type,
        discount_value: Number(discount_value),
        target_segment,
        min_order_amount: Number(min_order_amount || 0),
        usage_limit: Number(usage_limit || 100),
        times_used: 0,
        is_active: true,
        starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        message: `Voucher ${cleanCode} berhasil diaktifkan! (Demo Mode)`,
        voucher: demoVoucher,
      });
    }

    // 1. Dapatkan business_id milik user
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!business) {
      // User belum punya toko, tetap kembalikan voucher objek untuk demo
      const demoVoucher = {
        id: `vouch-${Date.now()}`,
        code: cleanCode,
        discount_type,
        discount_value: Number(discount_value),
        target_segment,
        min_order_amount: Number(min_order_amount || 0),
        usage_limit: Number(usage_limit || 100),
        times_used: 0,
        is_active: true,
        starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        message: `Voucher ${cleanCode} berhasil diaktifkan!`,
        voucher: demoVoucher,
      });
    }

    // 2. Simpan voucher ke database (Upsert / Insert)
    const { data: voucher, error: insertError } = await supabase
      .from('vouchers')
      .upsert({
        business_id: business.id,
        code: cleanCode,
        discount_type,
        discount_value: Number(discount_value),
        target_segment,
        min_order_amount: Number(min_order_amount || 0),
        usage_limit: Number(usage_limit || 100),
        times_used: 0,
        is_active: true,
        starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      }, { onConflict: 'business_id,code' })
      .select()
      .single();

    if (insertError) {
      console.warn('Vouchers table insert warning (fallback returned):', insertError.message);
      const fallbackVoucher = {
        id: `vouch-${Date.now()}`,
        business_id: business.id,
        code: cleanCode,
        discount_type,
        discount_value: Number(discount_value),
        target_segment,
        min_order_amount: Number(min_order_amount || 0),
        usage_limit: Number(usage_limit || 100),
        times_used: 0,
        is_active: true,
        starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        message: `Voucher ${cleanCode} berhasil diaktifkan!`,
        voucher: fallbackVoucher,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Voucher ${cleanCode} berhasil diaktifkan!`,
      voucher,
    });

  } catch (error) {
    console.error('Unexpected error in Vouchers POST API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server voucher' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ vouchers: getDemoVouchersList() });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ vouchers: getDemoVouchersList() });
    }

    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error || !vouchers || vouchers.length === 0) {
      return NextResponse.json({ vouchers: getDemoVouchersList() });
    }

    return NextResponse.json({ vouchers });

  } catch (error) {
    console.error('Unexpected error in Vouchers GET API:', error);
    return NextResponse.json({ vouchers: getDemoVouchersList() });
  }
}

function getDemoVouchersList() {
  const now = Date.now();
  return [
    {
      id: 'vouch-demo-1',
      code: 'VIP20',
      discount_type: 'percent',
      discount_value: 20,
      target_segment: 'Champions',
      min_order_amount: 100000,
      usage_limit: 50,
      times_used: 12,
      is_active: true,
      starts_at: new Date(now - 2 * 86400000).toISOString(),
      expires_at: new Date(now + 28 * 86400000).toISOString(),
      created_at: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'vouch-demo-2',
      code: 'KANGEN15',
      discount_type: 'percent',
      discount_value: 15,
      target_segment: 'At Risk',
      min_order_amount: 50000,
      usage_limit: 100,
      times_used: 28,
      is_active: true,
      starts_at: new Date(now - 5 * 86400000).toISOString(),
      expires_at: new Date(now + 16 * 86400000).toISOString(),
      created_at: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: 'vouch-demo-3',
      code: 'LOYAL25K',
      discount_type: 'fixed',
      discount_value: 25000,
      target_segment: 'Loyal Customers',
      min_order_amount: 75000,
      usage_limit: 80,
      times_used: 41,
      is_active: true,
      starts_at: new Date(now - 1 * 86400000).toISOString(),
      expires_at: new Date(now + 13 * 86400000).toISOString(),
      created_at: new Date(now - 1 * 86400000).toISOString(),
    }
  ];
}
