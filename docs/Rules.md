# 📜 AI Coding Agent Rules & Engineering Standards
## LORA (Local Omni-channel Regional Assistant)

> **Versi Dokumen:** 1.0 (MVP Competition Baseline)  
> **Target untuk Agent:** Antigravity / Claude / Cursor / GitHub Copilot  

---

## 🚫 1. Aturan Mutlak & Batasan Utama (Mandatory Directives)

1. **Strict TypeScript:** DILARANG menggunakan tipe `any`. Semua variabel, props komponen, payload API, dan data Supabase WAJIB memiliki tipe terdefinisi (`interface` atau `type`).
2. **Keamanan API Key:** DILARANG KERAS memanggil API Google Gemini atau TemanQRIS dari Client Component (browser). Semua panggilan API 3rd party WAJIB melalui Next.js Route Handlers (`/api/...`) atau Server Actions di server-side.
3. **Integritas RLS & Multi-Tenant:** Semua query basis data yang melibatkan data bisnis WAJIB menggunakan otentikasi Supabase Server Client agar PostgreSQL Row Level Security (RLS) ter-enforce secara otomatis. DILARANG mem-bypass RLS atau menggunakan Supabase Service Role Key kecuali untuk script administratif khusus.
4. **Resiliency & No Silent Failures:** DILARANG menyembunyikan exception (*swallowing errors*) dengan `catch {}` kosong. Panggilan API yang gagal WAJIB dicatat (*logged*) dan memiliki pesan feedback / fallback yang jelas ke UI.

---

## ⚡ 2. Aturan Next.js 16 App Router & React 19

1. **Server Components by Default:** Semua page dan komponen di dalam `src/app/` secara default adalah **React Server Components (RSC)**.
2. **Penggunaan `'use client'`:** Gunakan arahan `'use client'` HANYA pada komponen yang membutuhkan:
   - Event listeners (misal `onClick`, `onChange`).
   - React State & Lifecycle hooks (`useState`, `useEffect`, `useContext`).
   - Browser APIs atau library UI interaktif (misal Recharts container, Lucide icons interaktif, Cart Sheet).
3. **Data Fetching:**
   - Gunakan `async/await` langsung di dalam Server Components untuk mengambil data dari Supabase via `lib/supabase/server.ts`.
   - Gunakan Server Actions untuk pengiriman formulir (*mutations*) seperti membuat toko baru, menambah produk, atau mengubah stok.

---

## 🗄️ 3. Konvensi Supabase Client & Database

1. **Instansiasi Client:**
   - Komponen Client: Gunakan `import { createClient } from '@/lib/supabase/client'`.
   - Server Components / Route Handlers / Actions: Gunakan `import { createClient } from '@/lib/supabase/server'`.
2. **Dual-Role State Querying:**
   - Saat memeriksa akses pengguna, selalu baca flag `is_buyer`, `is_seller`, dan `is_admin` dari tabel `public.profiles`.
   - Pastikan pengguna yang memiliki kedua flag `is_buyer = true` & `is_seller = true` dapat mengakses antarmuka Pembeli maupun Dashboard Pemilik UMKM tanpa ada hambatan (*conflict*).
3. **Admin Protection Rule:**
   - Semua Route Handlers di bawah `/api/admin/*` dan halaman `/admin/*` WAJIB memverifikasi bahwa `profiles.is_admin = true`. Jika pengguna bukan Admin, sistem WAJIB mengembalikan status HTTP 403 (Forbidden) atau me-redirect pengguna ke halaman utama.

---

## 🤖 4. Konvensi Integrasi AI Google Gemini

1. **SDK Official:** Gunakan `@google/genai` v2.16+ untuk integrasi Gemini API.
2. **Model Selection:** Gunakan `gemini-1.5-flash` atau `gemini-2.0-flash` untuk respon cepat dan biaya efisien.
3. **Streaming Response:** Untuk Konsultan AI Chatbot, kembalikan respon menggunakan `ReadableStream` (Server-Sent Events) agar teks di-stream karakter demi karakter ke UI.
4. **Structured JSON Output:** Untuk BHS Engine & Recomendation, gunakan konfigurasi `responseSchema` atau prompt terstruktur JSON untuk memastikan output selalu konsisten.

---

## 💳 5. Konvensi Integrasi Payment & QRIS Generator

1. **Graceful Fallback Logic:**
   ```typescript
   try {
     // 1. Coba panggil API TemanQRIS
     const qrisData = await fetchTemanQRIS(orderTotal);
     return qrisData;
   } catch (error) {
     console.warn('TemanQRIS API fallback triggered:', error);
     // 2. Fallback otomatis ke Native QRIS SVG Generator
     return generateNativeEMVCoQRIS(orderTotal, businessName);
   }
   ```
2. **Order Status Lifecycle:** Status pesanan di tabel `public.orders` WAJIB mengikuti alur baku: `pending` ➔ `paid` ➔ `processing` ➔ `completed` (atau `cancelled`).

---

## 🧹 6. Standar Kerapian Kode & Commit

1. Gunakan nama variabel dan fungsi dalam Bahasa Inggris yang deskriptif (misal: `calculateBusinessHealthScore`, `generateQRISPayload`).
2. Pisahkan logika matematika / analitis ke dalam folder `src/lib/engines/` agar mudah diuji secara terpisah (*unit testing*).
