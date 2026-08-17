import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Memperbarui sesi autentikasi Supabase dan mengontrol routing navigasi tanpa Infinite Redirect Loop
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Memicu pembaruan token (refresh session)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 1. ATURAN MUTLAK GUEST ROUTES ( / , /login , /register ):
    // Middleware HANYA me-redirect user yang sudah login jika mereka mengakses rute tamu ini ke /katalog.
    // DILARANG me-redirect user jika berada di rute publik seperti /katalog atau /toko/[slug] (penjual bebas lihat katalog publik).
    const isGuestOnlyRoute = pathname === '/' || pathname === '/login' || pathname === '/register';
    if (user && isGuestOnlyRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/katalog';
        return NextResponse.redirect(url);
    }

    // 2. ATURAN PROTEKSI RUTE MEMBER/SELLER:
    // Jika belum login dan mencoba mengakses rute terproteksi, arahkan ke /login
    const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/toko/dashboard') ||
        pathname.startsWith('/akun') ||
        pathname.startsWith('/user') ||
        pathname.startsWith('/buka-toko') ||
        pathname.includes('/checkout');

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('alert', 'session_expired');
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

/**
 * Middleware utama Next.js
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

/**
 * Config matcher mengecualikan static files & image assets
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
