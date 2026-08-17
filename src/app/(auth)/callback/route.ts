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
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Jika gagal atau ada error, kembalikan ke halaman login dengan pesan error
    return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
