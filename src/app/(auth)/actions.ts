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

    if (!email || !password || !fullName) {
        return { error: 'Mohon lengkapi semua kolom wajib.' }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return { error: authError.message }
    }

    // Jika sukses, masukkan ke tabel profiles dengan default role pembeli
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
            {
                id: authData.user.id,
                full_name: fullName,
                phone_number: phone || null,
                is_buyer: true,   // Default Pembeli (Shopee Style)
                is_seller: false, // Belum aktif sebagai seller
            }
        ])

        if (profileError) {
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

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

// 3. Fungsi Keluar (Log Out)
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

// 4. Fungsi Login via Google OAuth SSO (FR-001)
export async function loginWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.url) {
        redirect(data.url)
    }
}