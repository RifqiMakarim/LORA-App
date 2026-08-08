# 🎨 UI/UX & Design System Document
## LORA (Local Omni-channel Regional Assistant)

> **Versi Dokumen:** 1.0 (MVP Competition Baseline)  
> **Tema Desain:** Modern Regional Elegance (Deep Indigo & Terracotta Warm)  

---

## 🎭 1. Filosofi Desain & Identitas Visual

LORA dirancang dengan pendekatan **Zero-Learning-Curve** dan **Modern Regional Elegance**. Antarmuka menggabungkan nuansa kebudayaan lokal Daerah Istimewa Yogyakarta & Jawa Tengah dengan estetika aplikasi SaaS kelas dunia (*premium glassmorphism, subtle micro-animations, dan clean contrast*).

---

## 🎨 2. Palet Warna (Color Palette Tokens)

Sistem menggunakan variabel warna Tailwind CSS & HSL yang konsisten di seluruh aplikasi:

```css
:root {
  /* Brand Primary & Accents */
  --primary-indigo: #1E293B;      /* Deep Indigo - Dominan Header & Card Boundaries */
  --accent-terracotta: #D97706;   /* Terracotta Warm - Aksesbilitas & CTA Utama */
  --terracotta-hover: #B45309;    /* Deep Amber/Terracotta Hover */
  
  /* Backgrounds & Surfaces */
  --bg-app-light: #F8FAFC;        /* Slate-50 Light Background */
  --bg-surface-light: #FFFFFF;    /* Pure White Card Surface */
  --bg-app-dark: #0F172A;         /* Slate-900 Dark Background */
  --bg-surface-dark: #1E293B;     /* Slate-800 Card Surface */

  /* BHS & Inventory Status Colors */
  --status-safe: #10B981;         /* Emerald-500 - Health Score Baik / Stok Aman */
  --status-warning: #F59E0B;      /* Amber-500 - Perlu Perhatian / Menjelang Habis (ROP) */
  --status-danger: #F43F5E;       /* Rose-500 - Stok Habis / Health Score Rendah */
  --status-info: #3B82F6;         /* Blue-500 - Event Daerah / Information */
}
```

---

## 📐 3. Tipografi & Tata Letak (Typography & Hierarchy)

- **Font Family:** `Inter`, `Outfit`, sans-serif (Google Fonts modern).
- **Skala Hirarki Teks:**
  - `H1 (Page Title)`: `text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white`
  - `H2 (Section Header)`: `text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100`
  - `H3 (Card Title)`: `text-lg font-medium text-slate-800 dark:text-slate-200`
  - `Body Text`: `text-sm text-slate-600 dark:text-slate-300 leading-relaxed`
  - `Caption & Badge`: `text-xs font-semibold text-slate-500 dark:text-slate-400`

---

## 🧩 4. Cetak Biru Komponen Utama (Component Blueprints)

### 4.1 Header & Dual-Role View Switcher
- **Lokasi:** Sticky Top Navbar.
- **Elemen:**
  - Logo LORA + Badge Wilayah ("DIY & Jateng").
  - Navigation Links (Dashboard, Inventori, Prediksi, Konsultan AI, Event Daerah).
  - **Role Switcher Button (Elemen Kunci):**
    - Jika pengguna memiliki status dual role (`is_buyer` & `is_seller`), tampilkan *Toggle Switcher* yang mulus:  
      `[ 🏪 Dashboard UMKM ] <---> [ 🛒 Mode Pembeli ]`
    - Jika pengguna baru memiliki 1 role (misal Customer saja), tampilkan tombol CTA:  
      `[ + Buka Toko UMKM Baru ]`

### 4.2 Public Smart Digital Storefront (`/toko/[slug]`)
- **Header Storefront:** Banner gambar toko, Logo UMKM, Nama Usaha, Deskripsi, Badge Alamat Wilayah (Provinsi/Kabupaten), dan Tombol WhatsApp Direct.
- **Kategori Filter:** Tab pill horizontal interaktif (`Semua`, `Batik`, `Kuliner`, `Oleh-oleh`, dll).
- **Product Grid:** Responsive grid (2 kolom di mobile 360px, 4 kolom di desktop 1024px). Setiap kartu memiliki harga, status stok, dan tombol `+ Keranjang`.
- **Floating Cart Sheet:** Tombol floating keranjang belanja di pojok kanan bawah yang menampilkan jumlah item dan total harga, yang saat diklik membuka *Slide-over Sheet* ringkasan pesanan & tombol **"Bayar Sekarang"**.

### 4.3 In-App Payment Checkout Modal
- **Trigger:** Tombol "Bayar Sekarang" di Keranjang Belanja.
- **Tampilan:**
  - Ringkasan Rincian Pesanan (Produk, Kuantitas, Total Nominal).
  - **Komponen Kode QRIS (Centerpiece):** Render QR Code SVG terpusat dengan timer batas waktu pembayaran.
  - Tombol aksi: `[ Download Kode QRIS ]`, `[ Bagikan ke WhatsApp ]`, dan `[ Simulasi Pembayaran Sukses (Demo Mode) ]`.

### 4.4 Business Dashboard & Business Health Score (BHS) Gauge
- **BHS Meter Widget:** Visualisasi circular gauge / progress ring (0–100) berwarna dinamis (Emerald jika >75, Amber jika 50-74, Rose jika <50).
- **KPI Summary Grid:** 4 Kartu Metric (Omzet, Profit, Total Transaksi, Storefront Impressions).
- **Recharts Line Container:** Grafik omzet harian dengan garis tren *smooth curve* dan *tooltip hover* yang kaya informasi.

### 4.5 AI Business Consultant Drawer (Conversational BI)
- **Tampilan:** Floating Chat Button yang dapat diekspansi menjadi Slide-over Drawer atau Fullscreen Page.
- **Chat Bubbles:** Pesan pengguna di kanan (Terracotta background), pesan Gemini AI di kiri (Indigo Surface background).
- **Streaming Response Effect:** Animasi *pulsing cursor* saat teks AI sedang di-stream real-time.
- **Quick Suggestion Chips:** Tombol rekomendasi pertanyaan cepat:  
  - *"Bagaimana kesehatan bisnis saya bulan ini?"*  
  - *"Produk apa yang perlu di-restock minggu ini?"*  
  - *"Apa event lokal terdekat di DIY-Jateng yang bisa saya manfaatkan?"*

### 4.6 Admin Event Management Page (`/admin/events`)
- **Fitur Utama:** Formulir Input Tanggal & Kegiatan Event Kebudayaan/Pariwisata Daerah (DIY & Jawa Tengah).
- **Elemen Antarmuka Form:**
  - `Input Nama Kegiatan`: Text input (contoh: *"Sekaten Yogyakarta 2026"*).
  - `Date Range Picker`: Input Tanggal Mulai (`start_date`) & Tanggal Selesai (`end_date`).
  - `Select Wilayah`: Dropdown Provinsi (DIY / Jawa Tengah) & Kota/Kabupaten.
  - `Select Estimasi Dampak`: Dropdown *Low*, *Medium*, *High*, *Massive*.
  - `Textarea Deskripsi`: Deskripsi singkat kegiatan & saran penyesuaian promosi UMKM.
- **Data Table:** Tabel direktori master event dengan tombol `Edit`, `Hapus`, dan `Filter Wilayah`.


---

## 📱 5. Panduan Responsivitas (Responsive Breakpoints)

- **Mobile (360px – 639px):** Layout 1 kolom, Bottom Navigation Bar / Floating Action Buttons, Cart Sheet slide-over dari bawah.
- **Tablet (640px – 1023px):** Layout 2 kolom grid, Sidebar collapsible.
- **Desktop (1024px – 1920px):** Layout 3-4 kolom grid, Persistent Left Sidebar Navigation, Full Recharts visualizations.
