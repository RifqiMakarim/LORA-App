import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validasi Sesi Seller
 */
async function getSellerBusiness(supabase: any, userId: string) {
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  return business;
}

/**
 * PUT /api/seller/categories
 * Mengubah nama kategori di semua produk terkait milik toko seller
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await getSellerBusiness(supabase, user.id);
    if (!business) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();
    const { oldCategory, newCategory } = body;

    if (!oldCategory || !newCategory) {
      return NextResponse.json({ error: 'Kategori lama dan baru wajib diisi.' }, { status: 400 });
    }

    // Update produk yang memiliki kategori lama
    const { error } = await supabase
      .from('products')
      .update({ category: newCategory })
      .eq('category', oldCategory)
      .eq('business_id', business.id);

    if (error) {
      return NextResponse.json({ error: `Gagal mengubah kategori: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * DELETE /api/seller/categories
 * Menghapus kategori (mengubah kategori produk bersangkutan menjadi 'Lainnya')
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await getSellerBusiness(supabase, user.id);
    if (!business) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Nama kategori wajib disertakan.' }, { status: 400 });
    }

    // Reset kategori produk terkait menjadi 'Lainnya'
    const { error } = await supabase
      .from('products')
      .update({ category: 'Lainnya' })
      .eq('category', category)
      .eq('business_id', business.id);

    if (error) {
      return NextResponse.json({ error: `Gagal menghapus kategori: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
