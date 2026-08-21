'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UpdateProfileInput {
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const fullNameTrimmed = input.fullName.trim();
  if (!fullNameTrimmed) {
    return { error: 'Nama lengkap wajib diisi.' };
  }

  // Update profiles table
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullNameTrimmed,
      phone_number: input.phone ? input.phone.trim() : null,
      avatar_url: input.avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/akun');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  if (!password || password.length < 6) {
    return { error: 'Kata sandi minimal terdiri dari 6 karakter.' };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
