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
 * POST /api/seller/products
 * Tambah produk baru
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await getSellerBusiness(supabase, user.id);
    if (!business) {
      return NextResponse.json({ error: 'Anda harus memiliki toko terdaftar untuk menambahkan produk.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      stock,
      min_stock,
      image_url,
    } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Field name, price, dan stock wajib diisi.' }, { status: 400 });
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        business_id: business.id,
        name,
        description: description || null,
        category: category || 'Default',
        price: Number(price),
        stock: Number(stock),
        min_stock: min_stock !== undefined ? Number(min_stock) : 10,
        image_url: image_url || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Gagal menambahkan produk: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error in POST seller/products:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * PUT /api/seller/products
 * Update data produk
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
    const {
      id,
      name,
      description,
      category,
      price,
      stock,
      min_stock,
      image_url,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID produk wajib disertakan.' }, { status: 400 });
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        name,
        description: description !== undefined ? description : undefined,
        category: category !== undefined ? category : undefined,
        price: price !== undefined ? Number(price) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        min_stock: min_stock !== undefined ? Number(min_stock) : undefined,
        image_url: image_url !== undefined ? image_url : undefined,
        is_active: is_active !== undefined ? !!is_active : undefined,
      })
      .eq('id', id)
      .eq('business_id', business.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Gagal memperbarui produk: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error in PUT seller/products:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * DELETE /api/seller/products
 * Hapus produk
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID produk wajib disertakan.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      return NextResponse.json({ error: `Gagal menghapus produk: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (error) {
    console.error('Error in DELETE seller/products:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
