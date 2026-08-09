'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// 1. Fungsi Registrasi (Sign Up - Default Pembeli)
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

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
                phone_number: phone,
                is_buyer: true,   // Otomatis menjadi pembeli
                is_seller: false, // Belum punya toko saat pertama kali daftar
            }
        ])

        if (profileError) {
            return { error: profileError.message }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/') // Arahkan ke halaman beranda pembeli
}

// 2. Fungsi Masuk (Log In)
export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/') // Untuk sementara arahkan ke beranda 
}

// 3. Fungsi Keluar (Log Out)
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}