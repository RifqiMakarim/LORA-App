import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Jika berhasil login, akan diarahkan ke halaman utama (/)
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()

        // Menukarkan kode rahasia dari Google OAuth dengan sesi pengguna Supabase
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Ambil data user dari sesi yang baru aktif
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Cek apakah profil sudah tersedia di tabel profiles
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle()

                if (!existingProfile) {
                    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna LORA'
                    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

                    await supabase.from('profiles').insert([{
                        id: user.id,
                        full_name: fullName,
                        avatar_url: avatarUrl,
                        is_buyer: true,
                        is_seller: false,
                        is_admin: false,
                    }])
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Jika gagal atau ada error, kembalikan ke halaman login dengan pesan error
    return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
