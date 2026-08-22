'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
    error?: string;
} | null;

// 1. Fungsi Registrasi (Sign Up - Default Pembeli Gaya Shopee)
export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    if (!email || !password || !fullName || !phone) {
        return { error: 'Mohon lengkapi semua kolom wajib.' }
    }

    // 1. Cek Duplikasi Nomor WhatsApp di tabel profiles SEBELUM pembuatan akun
    const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phone)
        .limit(1)
        .maybeSingle();

    if (existingPhone) {
        return { error: 'Nomor WhatsApp sudah terdaftar. Gunakan nomor lain.' };
    }

    // 2. Pembuatan Akun via Supabase Auth & Cek Duplikasi Email
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        const errorMsg = authError.message.toLowerCase();
        if (
            errorMsg.includes('already registered') ||
            errorMsg.includes('already in use') ||
            errorMsg.includes('user_already_exists') ||
            authError.status === 422
        ) {
            return { error: 'Email ini sudah terdaftar. Silakan masuk.' };
        }
        return { error: authError.message }
    }

    // 3. Jika sukses, masukkan ke tabel profiles dengan default role pembeli
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
            {
                id: authData.user.id,
                full_name: fullName,
                phone_number: phone,
                is_buyer: true,   // Default Pembeli (Shopee Style)
                is_seller: false, // Belum aktif sebagai seller
            }
        ])

        if (profileError) {
            const profileErrorMsg = profileError.message.toLowerCase();
            if (profileErrorMsg.includes('phone') || profileErrorMsg.includes('unique')) {
                return { error: 'Nomor WhatsApp sudah terdaftar. Gunakan nomor lain.' };
            }
            return { error: profileError.message }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

// 2. Fungsi Masuk (Log In)
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email dan kata sandi wajib diisi.' }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Cek apakah user adalah Super Admin (admin@lora.id / is_admin === true)
    if (authData?.user?.id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', authData.user.id)
            .maybeSingle()

        if (profile?.is_admin || authData.user.email === 'admin@lora.id') {
            revalidatePath('/', 'layout')
            redirect('/admin')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/katalog')
}

// 3. Fungsi Keluar (Log Out)
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}

// 4. Fungsi Login via Google OAuth SSO (FR-001)
export async function loginWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://loraapp.vercel.app'}/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.url) {
        redirect(data.url)
    }
}