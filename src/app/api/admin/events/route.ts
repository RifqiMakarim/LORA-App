import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Middleware/Helper untuk memvalidasi role Admin
 */
async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.is_admin) {
    return { error: 'Akses ditolak. Menu ini hanya untuk Administrator.', status: 403 };
  }

  return { supabase, user };
}

/**
 * POST /api/admin/events
 * Membuat event baru (Admin Only)
 */
export async function POST(request: Request) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error || !adminCheck.supabase) {
      return NextResponse.json({ error: adminCheck.error || 'Akses ditolak.' }, { status: adminCheck.status || 403 });
    }

    const { supabase } = adminCheck;
    const body = await request.json();

    const {
      title,
      province_name,
      city_name,
      start_date,
      end_date,
      description,
      expected_tourist_impact,
    } = body;

    // Validasi input wajib
    if (!title || !province_name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Field title, province_name, start_date, dan end_date wajib diisi.' }, { status: 400 });
    }

    const { data: newEvent, error } = await supabase
      .from('local_events')
      .insert({
        title,
        province_name,
        city_name: city_name || null,
        start_date,
        end_date,
        description: description || null,
        expected_tourist_impact: expected_tourist_impact || 'medium',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Gagal membuat event: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Error in POST admin/events:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/events
 * Mengubah event yang ada (Admin Only)
 */
export async function PUT(request: Request) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error || !adminCheck.supabase) {
      return NextResponse.json({ error: adminCheck.error || 'Akses ditolak.' }, { status: adminCheck.status || 403 });
    }

    const { supabase } = adminCheck;
    const body = await request.json();

    const {
      id,
      title,
      province_name,
      city_name,
      start_date,
      end_date,
      description,
      expected_tourist_impact,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID event wajib disertakan untuk melakukan update.' }, { status: 400 });
    }

    const { data: updatedEvent, error } = await supabase
      .from('local_events')
      .update({
        title,
        province_name,
        city_name: city_name || null,
        start_date,
        end_date,
        description: description || null,
        expected_tourist_impact: expected_tourist_impact || 'medium',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Gagal memperbarui event: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error in PUT admin/events:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/events
 * Menghapus event (Admin Only)
 */
export async function DELETE(request: Request) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error || !adminCheck.supabase) {
      return NextResponse.json({ error: adminCheck.error || 'Akses ditolak.' }, { status: adminCheck.status || 403 });
    }

    const { supabase } = adminCheck;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID event wajib disertakan dalam query parameter (?id=...).' }, { status: 400 });
    }

    const { error } = await supabase
      .from('local_events')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: `Gagal menghapus event: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Event berhasil dihapus.' });
  } catch (error) {
    console.error('Error in DELETE admin/events:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
