import { createBrowserClient } from '@supabase/ssr';

// Mengambil URL dan Key dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validasi agar aplikasi memberikan peringatan jika .env belum diisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key belum dikonfigurasi di file .env.local');
}

// Mengekspor instance browser client agar sesi cookie tersinkronisasi otomatis dengan server
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);