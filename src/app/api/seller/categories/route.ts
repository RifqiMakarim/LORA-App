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
 * GET /api/seller/categories
 * Mengambil semua kategori dari tabel product_categories.
 * Jika kosong, lakukan auto-seed kategori bawaan.
 */
export async function GET() {
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

    // Ambil data kategori dari product_categories
    let { data: categories, error } = await supabase
      .from('product_categories')
      .select('name')
      .eq('business_id', business.id)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: `Gagal mengambil kategori: ${error.message}` }, { status: 500 });
    }

    // Auto-seed kategori bawaan jika tabel masih kosong untuk toko ini
    if (!categories || categories.length === 0) {
      const defaultCategories = ['Batik', 'Kuliner', 'Kerajinan', 'Aksesori', 'Lainnya'];
      const insertData = defaultCategories.map(name => ({
        business_id: business.id,
        name
      }));

      const { data: seededCategories, error: seedError } = await supabase
        .from('product_categories')
        .insert(insertData)
        .select('name');

      if (seedError) {
        console.error('Error auto-seeding categories:', seedError.message);
      } else {
        categories = seededCategories;
      }
    }

    const categoryNames = (categories || []).map((c: any) => c.name);
    return NextResponse.json({ success: true, data: categoryNames });
  } catch (error) {
    console.error('Error in GET seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * POST /api/seller/categories
 * Menambahkan kategori baru ke tabel product_categories
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
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('product_categories')
      .insert({
        business_id: business.id,
        name: name.trim()
      });

    if (error) {
      return NextResponse.json({ error: `Gagal menambahkan kategori: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * PUT /api/seller/categories
 * Mengubah nama kategori di product_categories dan meng-update kolom category di products
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

    // 1. Update nama kategori di tabel product_categories
    const { error: catError } = await supabase
      .from('product_categories')
      .update({ name: newCategory.trim() })
      .eq('name', oldCategory)
      .eq('business_id', business.id);

    if (catError) {
      return NextResponse.json({ error: `Gagal mengubah kategori: ${catError.message}` }, { status: 500 });
    }

    // 2. Update kolom category pada semua produk terkait di tabel products
    const { error: prodError } = await supabase
      .from('products')
      .update({ category: newCategory.trim() })
      .eq('category', oldCategory)
      .eq('business_id', business.id);

    if (prodError) {
      console.warn('Warning: Gagal meng-update produk terkait:', prodError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * DELETE /api/seller/categories
 * Menghapus kategori di product_categories dan mereset kolom category di products menjadi 'Lainnya'
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

    // 1. Hapus baris kategori di tabel product_categories
    const { error: catError } = await supabase
      .from('product_categories')
      .delete()
      .eq('name', category)
      .eq('business_id', business.id);

    if (catError) {
      return NextResponse.json({ error: `Gagal menghapus kategori: ${catError.message}` }, { status: 500 });
    }

    // 2. Reset kategori produk terkait di tabel products menjadi 'Lainnya'
    const { error: prodError } = await supabase
      .from('products')
      .update({ category: 'Lainnya' })
      .eq('category', category)
      .eq('business_id', business.id);

    if (prodError) {
      console.warn('Warning: Gagal meng-update produk terkait:', prodError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE seller/categories:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
