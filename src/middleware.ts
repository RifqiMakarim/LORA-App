import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Memperbarui sesi autentikasi Supabase dan menyinkronkan cookie pada setiap request
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

    // Memicu pembaruan token (refresh session) dengan memanggil getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Proteksi Rute Terproteksi: Jika belum login dan mencoba mengakses rute rahasia/transaksi
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/akun') ||
        request.nextUrl.pathname.startsWith('/buka-toko') ||
        request.nextUrl.pathname.includes('/checkout') ||
        request.nextUrl.pathname.endsWith('/checkout');

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('alert', 'session_expired');
        return NextResponse.redirect(url);
    }

    // Landing page (/) should remain accessible for both authenticated and guest users.

    return supabaseResponse;
}

/**
 * Middleware utama Next.js untuk penanganan Supabase Auth
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

/**
 * Config matcher untuk mengecualikan file statis, aset gambar, dan Next.js internal routes
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
