# 📄 Product Requirements Document (PRD)
## LORA (Local Omni-channel Regional Assistant)

> **Versi Dokumen:** 1.0 (MVP Competiton Release)  
> **Status:** Approved Baseline  
> **Konteks:** MVP Kompetisi Digitalisasi UMKM (Daerah Istimewa Yogyakarta & Jawa Tengah)  

---

## 🎯 1. Ringkasan Eksekutif (Executive Summary)

**LORA (Local Omni-channel Regional Assistant)** adalah platform *AI Business Intelligence & Decision Support System* berbasis web (PWA-ready) yang terintegrasi dengan *Smart Digital Storefront* dan *In-App QRIS Payment Checkout*. Platform ini dirancang khusus untuk memfasilitasi transformasi digital UMKM sektor Batik, Kuliner Lokal, Kerajinan, Oleh-oleh, Desa Wisata, dan Industri Kreatif di wilayah DIY dan Jawa Tengah.

LORA memecahkan 3 masalah utama UMKM lokal:
1. **Buta Analitik Finansial & Stok:** Kesulitan menghitung stok aman (*Safety Stock*), titik pemesanan ulang (*Reorder Point*), dan skor kesehatan bisnis secara kuantitatif.
2. **Keterbatasan Etalase Digital & Checkout:** Membutuhkan sistem etalase produk publik yang langsung memiliki sistem pembayaran QRIS otomatis tanpa alur checkout rumit.
3. **Kelemahan Antisipasi Tren & Event Daerah:** Belum mampunya UMKM memanfaatkan momen agenda kebudayaan/pariwisata lokal (seperti Sekaten, Dieng Culture Festival) untuk penyesuaian stok dan strategi promosi.

---

## 👥 2. Pengguna & Model Peran (User Roles & Permissions)

Sistem mendukung **3 Role Utama**, **1 State Akses Publik (Guest)**, serta kemampuan **Dual Role dalam 1 Akun**.

### 2.1 Pengelompokan Role
1. **Guest (Pengunjung Publik / Tanpa Login)**:
   - Pengunjung umum atau calon pembeli yang mengakses URL Etalase Publik (`/toko/[slug]`).
   - Dapat melihat katalog produk, filter kategori, detail produk, dan memasukkan produk ke Keranjang Belanja.
2. **Customer / Pembeli (`is_buyer = true`)**:
   - Pengguna terautentikasi yang melakukan transaksi pembelian.
   - Dapat melakukan *In-App Payment Checkout* (generate QRIS & bayar), melihat histori transaksi pembelian, dan menyimpan profil alamat.
3. **Pemilik UMKM / Seller (`is_seller = true`)**:
   - Pelaku usaha yang mengelola etalase toko dan operasional bisnis.
   - Mengakses Dashboard BI, Business Health Score (BHS) Engine, AI Business Consultant, Prediksi Penjualan (Hybrid Model), Smart Inventory Alert, dan QRIS Payment Management.
4. **Admin System (`is_admin = true`)**:
   - Tim internal LORA yang mengelola Master Data Event Kebudayaan/Pariwisata DIY-Jateng, pemantauan sistem, dan audit log.

### 2.2 Mekanisme Dual Role & Onboarding
- **Initial Registration:** Saat mendaftar, pengguna memilih role awal: *Customer* ATAU *Pemilik UMKM*.
- **Onboarding Pemilik UMKM:** Jika mendaftar sebagai Pemilik UMKM, pengguna wajib melengkapi data profil bisnis (Nama Toko, Slug URL, WhatsApp, dan Wilayah API Jawa/DIY).
- **In-App Switcher & Tambah Role:** Di dalam aplikasi (header/profile menu), terdapat tombol **"Aktifkan Role Pemilik UMKM"** (jika awal mendaftar Customer) atau **"Switch ke Mode Pembeli"**. Sistem memperbarui flag `is_buyer` & `is_seller` pada tabel `public.profiles` tanpa memerlukan logout/membuat akun baru.

---

## 🛍️ 3. Alur Transaksi In-App Payment Checkout

1. **Eksplorasi Katalog:** Guest/Customer membuka etalase publik (`/toko/[slug]`).
2. **Keranjang Belanja:** Menambahkan item ke Keranjang Belanja (Shopping Cart).
3. **In-App Checkout:** Klik tombol **"Bayar Sekarang"**.
4. **Order Creation & QRIS Generation:**
   - Sistem secara otomatis membuat record `orders` (status `pending`) dan `order_items` di Supabase DB.
   - Sistem memanggil API TemanQRIS untuk meng-generate kode QRIS berbasis total nominal.
   - Apabila API TemanQRIS mengalami gangguan/timeout/credentials kosong, sistem secara otomatis beralih ke **Native QRIS Engine** (EMVCo SVG QR Generator).
5. **Pembayaran & Konfirmasi:** Customer memindai QRIS dan menyelesaikan pembayaran.
6. **Integrasi Real-Time:** Setelah pembayaran terkonfirmasi, status order berubah menjadi `paid`, stok produk berkurang otomatis, dan data transaksi langsung masuk ke Dashboard Analytics & BHS Engine milik Pemilik UMKM.

---

## ⚡ 4. Spesifikasi Fitur Fungsional (Functional Requirements)

### Modul 1: Authentication, Dual-Role & Onboarding
- **FR-001:** Sistem HARUS mendukung registrasi & login via Email/Password dan Google OAuth SSO.
- **FR-002:** Sistem HARUS menyediakan alur onboarding penetapan slug URL etalase unik (`/toko/[slug]`) dan lokasi wilayah (Provinsi, Kota/Kab, Kecamatan, Desa).
- **FR-003:** Sistem HARUS menyediakan fitur *Role Switcher* di header untuk pengguna yang memiliki status dual role (`is_buyer = true` & `is_seller = true`).

### Modul 2: Smart Digital Storefront & Shopping Cart
- **FR-004:** Sistem HARUS menyediakan halaman etalase publik yang dapat diakses publik/Guest tanpa login.
- **FR-005:** Sistem HARUS menyediakan fitur Keranjang Belanja (Shopping Cart) lokal yang persisten.
- **FR-006:** Sistem HARUS menyediakan fitur *In-App Payment Checkout* yang secara otomatis meng-generate QRIS transaksi.
- **FR-007:** Sistem HARUS mencatat impresi halaman etalase dan klik produk untuk analisis *Storefront Analytics*.

### Modul 3: Business Dashboard & KPI Visualization
- **FR-008:** Sistem HARUS menampilkan kartu KPI (Total Omzet, Keuntungan, Jumlah Transaksi, Produk Terlaris, Impressions).
- **FR-009:** Sistem HARUS menyediakan grafik garis interaktif tren omzet (Recharts) dengan filter rentang waktu (7 Hari, Bulan Ini, 3 Bulan, Kustom).

### Modul 4: Business Health Score (BHS) Engine
- **FR-010:** Sistem HARUS menghitung skor BHS (skala 0–100) berbasis 6 indikator utama (Omzet, Profit Margin, Turn Rate Stok, Customer Retention, Inventory Safety, Event Adaptability).
- **FR-011:** Sistem HARUS menampilkan breakdown skor dan indikator terlemah beserta rekomendasi perbaikan berbasis AI.

### Modul 5: AI Business Consultant (Conversational BI)
- **FR-012:** Sistem HARUS menyediakan antarmuka chat real-time berbasis *Server-Sent Events (SSE) streaming response* dengan Google Gemini API.
- **FR-013:** Sistem HARUS menyertakan agregasi ringkasan data transaksi 30 hari terakhir ke dalam *system prompt context*.
- **FR-014:** Sistem HARUS menyimpan histori percakapan antar sesi per `business_id`.

### Modul 6: Hybrid Sales Forecast Engine
- **FR-015:** Sistem HARUS menghitung prediksi penjualan 30 hari ke depan menggunakan model matematik prediktif deterministik (Moving Average / Holt-Winters) beserta *95% Confidence Interval*.
- **FR-016:** Sistem HARUS menggunakan Gemini AI untuk menginterpretasikan angka statistik tersebut dan menghasilkan narasi analisis kualitatif berbasis konteks event lokal.

### Modul 7: Smart Inventory & Restock Recommendation
- **FR-017:** Sistem HARUS menghitung status persediaan otomatis (*Aman, Menjelang Habis, Habis, Overstock*) berbasis *Reorder Point (ROP)* dan *Safety Stock*.
- **FR-018:** Sistem HARUS memberikan peringatan restock di *Notification Center* saat stok menyentuh ROP.

### Modul 8: Local Trend Analyzer & Event-Based Strategy (DIY & Jateng)
- **FR-019:** Sistem HARUS menyimpan dan menyajikan direktori kalender event kebudayaan/pariwisata daerah DIY & Jawa Tengah.
- **FR-020:** Sistem HARUS memberikan rekomendasi penyesuaian stok dan promosi khusus yang relevan dengan event daerah terdekat.
- **FR-023:** Sistem HARUS menyediakan antarmuka khusus Admin (`is_admin = true`) dengan formulir input Tanggal (Start Date & End Date) dan Kegiatan/Event Daerah (Nama, Deskripsi, Wilayah, & Estimasi Dampak Wisatawan) untuk mendukung pengayaan data *Trend Analyzer*.
- **FR-024:** Sistem HARUS secara otomatis mengintegrasikan data Tanggal & Kegiatan yang dimasukkan Admin ke dalam mesin analitis *Local Trend Analyzer* dan prompt context AI Recommendation bagi Pemilik UMKM.

### Modul 9: TemanQRIS Payment Generator & Fallback
- **FR-021:** Sistem HARUS terintegrasi dengan API TemanQRIS untuk pembuatan kode QRIS transaksi secara otomatis.
- **FR-022:** Sistem HARUS memiliki mekanisme *Graceful Fallback* ke *Native QRIS SVG Generator* jika API TemanQRIS mengalami timeout atau kendala jaringan.

---

## 🔒 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

- **NFR-001 (Performance):** First Contentful Paint (FCP) < 1.5 detik pada jaringan 4G.
- **NFR-002 (AI Latency):** First Chunk Streaming response AI Consultant < 2.0 detik.
- **NFR-003 (Security):** Isolasi data antar tenant bisnis dijamin 100% menggunakan PostgreSQL Row Level Security (RLS).
- **NFR-004 (Reliability):** Keandalan transaksi checkout QRIS 99.9% melalui mekanisme dual-fallback engine.
- **NFR-005 (Responsiveness):** Antarmuka responsif penuh dari resolusi layar 360px (mobile browser) hingga 1920px (desktop).
