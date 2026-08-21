-- ============================================================================
-- SEED DATASET KOMPREHENSIF MVP LORA (DIY & JAWA TENGAH)
-- ============================================================================
-- Fitur yang Didukung:
-- 1. Multi-Role Autentikasi (1 Admin + 5 Seller + 30 Buyer Bersegmentasi RFM)
--    Lengkap dengan auth.users & auth.identities untuk garansi 100% login GoTrue.
-- 2. 5 Toko UMKM Ikonik DIY & Jateng dengan Alamat & Koordinat Riil
-- 3. 20 Kategori Terdaftar pada tabel product_categories
-- 4. 100 Katalog Produk (20 per toko) dengan Foto CDN HD & Status Stok (Normal, ROP Alert, Out of Stock, Overstock)
-- 5. ~250 Transaksi Riil (90 Hari Terakhir) dengan Distribusi Status Lengkap
-- 6. Voucher Diskon Berbasis Segmen RFM & Event Budaya Lokal 2026
-- 7. Notifikasi Stok Menipis & Peringatan Sistem
-- 
-- Default Password Semua Akun Testing: LoraApp2026!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. PEMBERSIHAN DATA LAMA (SAFE TRUNCATE & RE-INIT)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE 
  public.order_items,
  public.orders,
  public.products,
  public.product_categories,
  public.vouchers,
  public.storefront_analytics,
  public.notifications,
  public.business_health_scores,
  public.sales_forecasts,
  public.recommendations,
  public.ai_messages,
  public.ai_conversations,
  public.local_events,
  public.businesses,
  public.profiles
CASCADE;

-- Bersihkan user testing lama di auth.users & auth.identities
DELETE FROM auth.identities 
WHERE email LIKE '%@lora.id' OR email LIKE '%@gmail.com';

DELETE FROM auth.users 
WHERE email LIKE '%@lora.id' OR email LIKE '%@gmail.com';

-- ----------------------------------------------------------------------------
-- 2. INJEKSI AKUN AUTENTIKASI (auth.users, auth.identities, & public.profiles)
-- ----------------------------------------------------------------------------

-- A. Akun Super Admin
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@lora.id',
  crypt('LoraApp2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Super Admin LORA","sub":"a0000000-0000-0000-0000-000000000001","email":"admin@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false,
  now() - interval '90 days', now()
);

INSERT INTO public.profiles (id, full_name, phone_number, is_buyer, is_seller, is_admin, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Super Admin LORA', '081100000001', true, false, true, now() - interval '90 days', now());

-- B. Akun 5 Seller UMKM
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at
) VALUES 
(
  'ae110000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'seller.batik@lora.id', crypt('LoraApp2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Rangga Daniswara","sub":"ae110000-0000-0000-0000-000000000001","email":"seller.batik@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false, now() - interval '90 days', now()
),
(
  'ae110000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'seller.gerabah@lora.id', crypt('LoraApp2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bambang Sutrisno","sub":"ae110000-0000-0000-0000-000000000002","email":"seller.gerabah@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false, now() - interval '90 days', now()
),
(
  'ae110000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'seller.bakpia@lora.id', crypt('LoraApp2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Endang Sri Wahyuni","sub":"ae110000-0000-0000-0000-000000000003","email":"seller.bakpia@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false, now() - interval '90 days', now()
),
(
  'ae110000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'seller.jepara@lora.id', crypt('LoraApp2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Haji Ahmad Fauzi","sub":"ae110000-0000-0000-0000-000000000004","email":"seller.jepara@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false, now() - interval '90 days', now()
),
(
  'ae110000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'seller.semarang@lora.id', crypt('LoraApp2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dewi Sartika","sub":"ae110000-0000-0000-0000-000000000005","email":"seller.semarang@lora.id","email_verified":true,"phone_verified":false}'::jsonb,
  false, false, now() - interval '90 days', now()
);

INSERT INTO public.profiles (id, full_name, phone_number, is_buyer, is_seller, is_admin, created_at, updated_at) VALUES 
('ae110000-0000-0000-0000-000000000001', 'Rangga Daniswara', '081299880001', true, true, false, now() - interval '90 days', now()),
('ae110000-0000-0000-0000-000000000002', 'Bambang Sutrisno', '081299880002', true, true, false, now() - interval '90 days', now()),
('ae110000-0000-0000-0000-000000000003', 'Endang Sri Wahyuni', '081299880003', true, true, false, now() - interval '90 days', now()),
('ae110000-0000-0000-0000-000000000004', 'Haji Ahmad Fauzi', '081299880004', true, true, false, now() - interval '90 days', now()),
('ae110000-0000-0000-0000-000000000005', 'Dewi Sartika', '081299880005', true, true, false, now() - interval '90 days', now());

-- C. Akun 30 Buyer Indonesia Bersegmentasi RFM
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at
) VALUES 
-- Champions (5 User)
('cb000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'danang.kusuma@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Raden Mas Danang Kusuma","sub":"cb000000-0000-0000-0000-000000000001","email":"danang.kusuma@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anindya.pratista@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Anindya Putri Pratista","sub":"cb000000-0000-0000-0000-000000000002","email":"anindya.pratista@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'budi.santoso.w@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Budi Santoso Wibowo","sub":"cb000000-0000-0000-0000-000000000003","email":"budi.santoso.w@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dr.ratnasari@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dr. Ratna Sari Dewi","sub":"cb000000-0000-0000-0000-000000000004","email":"dr.ratnasari@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hendra.setiawan88@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Hendra Setiawan","sub":"cb000000-0000-0000-0000-000000000005","email":"hendra.setiawan88@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),

-- Loyal Customers (6 User)
('cb000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'siti.nurhaliza.r@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Siti Nurhaliza Rahayu","sub":"cb000000-0000-0000-0000-000000000006","email":"siti.nurhaliza.r@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dimas.prasetyo@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dimas Prasetyo Utomo","sub":"cb000000-0000-0000-0000-000000000007","email":"dimas.prasetyo@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tri.wahyuni.astuti@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Tri Wahyuni Astuti","sub":"cb000000-0000-0000-0000-000000000008","email":"tri.wahyuni.astuti@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'agus.kurniawan.jogja@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Agus Kurniawan","sub":"cb000000-0000-0000-0000-000000000009","email":"agus.kurniawan.jogja@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya.safira.a@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Maya Safira Anggraini","sub":"cb000000-0000-0000-0000-000000000010","email":"maya.safira.a@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '75 days', now()),
('cb000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rizky.pratama.y@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Rizky Pratama Yudha","sub":"cb000000-0000-0000-0000-000000000011","email":"rizky.pratama.y@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '75 days', now()),

-- Potential Loyalists (6 User)
('cb000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fajar.hidayat@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fajar Hidayatullah","sub":"cb000000-0000-0000-0000-000000000012","email":"fajar.hidayat@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '60 days', now()),
('cb000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dewi.lestari.n@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dewi Lestari Ningrum","sub":"cb000000-0000-0000-0000-000000000013","email":"dewi.lestari.n@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '55 days', now()),
('cb000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bagus.nugroho.b@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bagus Nugroho","sub":"cb000000-0000-0000-0000-000000000014","email":"bagus.nugroho.b@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '50 days', now()),
('cb000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fitri.handayani@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fitri Handayani","sub":"cb000000-0000-0000-0000-000000000015","email":"fitri.handayani@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '45 days', now()),
('cb000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eko.prabowo.s@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Eko Prabowo Susanto","sub":"cb000000-0000-0000-0000-000000000016","email":"eko.prabowo.s@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '40 days', now()),
('cb000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'indah.permatasari@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Indah Permatasari","sub":"cb000000-0000-0000-0000-000000000017","email":"indah.permatasari@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '35 days', now()),

-- At Risk (6 User)
('cb000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bambang.wijanarko@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bambang Wijanarko","sub":"cb000000-0000-0000-0000-000000000018","email":"bambang.wijanarko@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sri.mulyani.h@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sri Mulyani Hartati","sub":"cb000000-0000-0000-0000-000000000019","email":"sri.mulyani.h@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'wahyu.hidayat99@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Wahyu Hidayat","sub":"cb000000-0000-0000-0000-000000000020","email":"wahyu.hidayat99@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dian.sastro.w@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dian Sastro Wardani","sub":"cb000000-0000-0000-0000-000000000021","email":"dian.sastro.w@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aris.munandar@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Aris Munandar","sub":"cb000000-0000-0000-0000-000000000022","email":"aris.munandar@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rina.kartika.s@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Rina Kartika Sari","sub":"cb000000-0000-0000-0000-000000000023","email":"rina.kartika.s@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '80 days', now()),

-- New Customers (4 User)
('cb000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gita.permata@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Gita Gutawa Permata","sub":"cb000000-0000-0000-0000-000000000024","email":"gita.permata@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '5 days', now()),
('cb000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'm.farhan.id@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Muhammad Farhan","sub":"cb000000-0000-0000-0000-000000000025","email":"m.farhan.id@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '4 days', now()),
('cb000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nabila.syakieb.p@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Nabila Syakieb Putri","sub":"cb000000-0000-0000-0000-000000000026","email":"nabila.syakieb.p@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '3 days', now()),
('cb000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aditya.bagaskara@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Aditya Bagaskara","sub":"cb000000-0000-0000-0000-000000000027","email":"aditya.bagaskara@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '2 days', now()),

-- Lost / Inactive (3 User)
('cb000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'joko.susilo.solo@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Joko Susilo","sub":"cb000000-0000-0000-0000-000000000028","email":"joko.susilo.solo@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nurul.hidayati@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Nurul Hidayati","sub":"cb000000-0000-0000-0000-000000000029","email":"nurul.hidayati@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yusuf.maulana@gmail.com', crypt('LoraApp2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Yusuf Maulana","sub":"cb000000-0000-0000-0000-000000000030","email":"yusuf.maulana@gmail.com","email_verified":true,"phone_verified":false}'::jsonb, false, false, now() - interval '90 days', now());

-- D. Injeksi Otomatis ke auth.identities (Krusial untuk GoTrue Auth Login)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  u.created_at,
  now()
FROM auth.users u
WHERE u.email LIKE '%@lora.id' OR u.email LIKE '%@gmail.com'
ON CONFLICT (provider_id, provider) DO NOTHING;

-- E. Injeksi ke public.profiles
INSERT INTO public.profiles (id, full_name, phone_number, is_buyer, is_seller, is_admin, created_at, updated_at) VALUES 
('cb000000-0000-0000-0000-000000000001', 'Raden Mas Danang Kusuma', '081223344001', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000002', 'Anindya Putri Pratista', '081223344002', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000003', 'Budi Santoso Wibowo', '081223344003', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000004', 'Dr. Ratna Sari Dewi', '081223344004', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000005', 'Hendra Setiawan', '081223344005', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000006', 'Siti Nurhaliza Rahayu', '081223344006', true, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000007', 'Dimas Prasetyo Utomo', '081223344007', true, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000008', 'Tri Wahyuni Astuti', '081223344008', true, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000009', 'Agus Kurniawan', '081223344009', true, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000010', 'Maya Safira Anggraini', '081223344010', true, false, false, now() - interval '75 days', now()),
('cb000000-0000-0000-0000-000000000011', 'Rizky Pratama Yudha', '081223344011', true, false, false, now() - interval '75 days', now()),
('cb000000-0000-0000-0000-000000000012', 'Fajar Hidayatullah', '081223344012', true, false, false, now() - interval '60 days', now()),
('cb000000-0000-0000-0000-000000000013', 'Dewi Lestari Ningrum', '081223344013', true, false, false, now() - interval '55 days', now()),
('cb000000-0000-0000-0000-000000000014', 'Bagus Nugroho', '081223344014', true, false, false, now() - interval '50 days', now()),
('cb000000-0000-0000-0000-000000000015', 'Fitri Handayani', '081223344015', true, false, false, now() - interval '45 days', now()),
('cb000000-0000-0000-0000-000000000016', 'Eko Prabowo Susanto', '081223344016', true, false, false, now() - interval '40 days', now()),
('cb000000-0000-0000-0000-000000000017', 'Indah Permatasari', '081223344017', true, false, false, now() - interval '35 days', now()),
('cb000000-0000-0000-0000-000000000018', 'Bambang Wijanarko', '081223344018', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000019', 'Sri Mulyani Hartati', '081223344019', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000020', 'Wahyu Hidayat', '081223344020', true, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000021', 'Dian Sastro Wardani', '081223344021', true, false, false, now() - interval '85 days', now()),
('cb000000-0000-0000-0000-000000000022', 'Aris Munandar', '081223344022', true, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000023', 'Rina Kartika Sari', '081223344023', true, false, false, now() - interval '80 days', now()),
('cb000000-0000-0000-0000-000000000024', 'Gita Gutawa Permata', '081223344024', true, false, false, now() - interval '5 days', now()),
('cb000000-0000-0000-0000-000000000025', 'Muhammad Farhan', '081223344025', true, false, false, now() - interval '4 days', now()),
('cb000000-0000-0000-0000-000000000026', 'Nabila Syakieb Putri', '081223344026', true, false, false, now() - interval '3 days', now()),
('cb000000-0000-0000-0000-000000000027', 'Aditya Bagaskara', '081223344027', true, false, false, now() - interval '2 days', now()),
('cb000000-0000-0000-0000-000000000028', 'Joko Susilo', '081223344028', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000029', 'Nurul Hidayati', '081223344029', true, false, false, now() - interval '90 days', now()),
('cb000000-0000-0000-0000-000000000030', 'Yusuf Maulana', '081223344030', true, false, false, now() - interval '90 days', now());

-- ----------------------------------------------------------------------------
-- 3. INJEKSI PROFIL BISNIS / TOKO UMKM (public.businesses)
-- ----------------------------------------------------------------------------
INSERT INTO public.businesses (
  id, owner_id, name, slug, description,
  province_id, province_name, city_id, city_name,
  district_id, district_name, village_id, village_name,
  address, google_maps_link, contact_number,
  logo_url, banner_url, qris_image_url, bank_name, bank_account_number,
  created_at, updated_at
) VALUES 
(
  'b0000000-0000-0000-0000-000000000001',
  'ae110000-0000-0000-0000-000000000001',
  'Batik Tulis Sekar Jagad',
  'batik-sekar-jagad',
  'Sentra kerajinan batik tulis sutra dan katun primissima asli Yogyakarta dengan motif klasik Keraton dan pewarna alami.',
  '34', 'DI Yogyakarta', '3471', 'Kota Yogyakarta',
  '347109', 'Mantrijeron', '3471091002', 'Suryodiningratan',
  'Jl. Tirtodipuran No. 17, Suryodiningratan, Kec. Mantrijeron, Kota Yogyakarta, DI Yogyakarta 55143',
  'https://maps.google.com/?q=Jl.+Tirtodipuran+No.17+Mantrijeron+Yogyakarta',
  '081299880001',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1200&q=80',
  'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126580014ID.LINKAJA.WWW01189360091400000000005204549953033605802ID5919BATIK+SEKAR+JAGAD6010YOGYAKARTA61055514362070703A016304D1A2',
  'Bank Central Asia (BCA)', '8910234501',
  now() - interval '90 days', now()
),
(
  'b0000000-0000-0000-0000-000000000002',
  'ae110000-0000-0000-0000-000000000002',
  'Studio Keramik & Gerabah Kasongan',
  'gerabah-kasongan',
  'Pusat kerajinan tembikar tanah liat, vas terracotta, guci artistik, dan perlengkapan tableware handmade dari Kasongan Bantul.',
  '34', 'DI Yogyakarta', '3402', 'Kabupaten Bantul',
  '340208', 'Kasihan', '3402082003', 'Bangunjiwo',
  'Jl. Kasongan Raya No. 42, Kajen, Bangunjiwo, Kec. Kasihan, Kab. Bantul, DI Yogyakarta 55184',
  'https://maps.google.com/?q=Jl.+Kasongan+Raya+Bangunjiwo+Kasihan+Bantul',
  '081299880002',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=80',
  'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126580014ID.LINKAJA.WWW01189360091400000000005204549953033605802ID5916GERABAH+KASONGAN6006BANTUL61055518462070703A026304E2B3',
  'Bank Mandiri', '1370019283741',
  now() - interval '90 days', now()
),
(
  'b0000000-0000-0000-0000-000000000003',
  'ae110000-0000-0000-0000-000000000003',
  'Bakpia & Oleh-Oleh Mataram 75',
  'bakpia-mataram-75',
  'Oleh-oleh legendaris khas Yogyakarta dengan resep autentik kacang hijau kulit renyah, bakpia kukus, dan aneka camilan Jawa.',
  '34', 'DI Yogyakarta', '3471', 'Kota Yogyakarta',
  '347108', 'Ngampilan', '3471081001', 'Notoprajan',
  'Jl. KS Tubun No. 75, Notoprajan, Kec. Ngampilan, Kota Yogyakarta, DI Yogyakarta 55261',
  'https://maps.google.com/?q=Jl.+KS+Tubun+No.75+Ngampilan+Yogyakarta',
  '081299880003',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
  'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126580014ID.LINKAJA.WWW01189360091400000000005204549953033605802ID5917BAKPIA+MATARAM+756010YOGYAKARTA61055526162070703A036304F3C4',
  'Bank Rakyat Indonesia (BRI)', '002901082736502',
  now() - interval '90 days', now()
),
(
  'b0000000-0000-0000-0000-000000000004',
  'ae110000-0000-0000-0000-000000000004',
  'Mebel Jati & Ukiran Kalingga Art',
  'mebel-jati-kalingga',
  'Pengrajin mebel kayu jati solid asli Jepara, seni ukir relief, kaligrafi, perlengkapan ruang tamu dan perkakas dapur kayu estetik.',
  '33', 'Jawa Tengah', '3320', 'Kabupaten Jepara',
  '332007', 'Tahunan', '3320072005', 'Tahunan',
  'Jl. Pemuda No. 88, Tahunan, Kec. Tahunan, Kab. Jepara, Jawa Tengah 59427',
  'https://maps.google.com/?q=Jl.+Pemuda+No.88+Tahunan+Jepara',
  '081299880004',
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126580014ID.LINKAJA.WWW01189360091400000000005204549953033605802ID5916KALINGGA+ART+JEP6006JEPARA61055942762070703A046304A4D5',
  'Bank Negara Indonesia (BNI)', '0829102847',
  now() - interval '90 days', now()
),
(
  'b0000000-0000-0000-0000-000000000005',
  'ae110000-0000-0000-0000-000000000005',
  'Bandeng Presto Juwana Asli',
  'bandeng-presto-juwana',
  'Kuliner legendaris khas Semarang dengan olahan ikan bandeng duri lunak vakum basah, lumpia rebung, dan aneka frozen food siap saji.',
  '33', 'Jawa Tengah', '3374', 'Kota Semarang',
  '337402', 'Semarang Selatan', '3374021004', 'Randusari',
  'Jl. Pandanaran No. 57, Randusari, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah 50244',
  'https://maps.google.com/?q=Jl.+Pandanaran+No.57+Randusari+Semarang',
  '081299880005',
  'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
  'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126580014ID.LINKAJA.WWW01189360091400000000005204549953033605802ID5918BANDENG+JUWANA+SMG6008SEMARANG61055024462070703A056304B5E6',
  'Bank Central Asia (BCA)', '0092837461',
  now() - interval '90 days', now()
);

-- ----------------------------------------------------------------------------
-- 4. INJEKSI KATEGORI PRODUK (public.product_categories)
-- ----------------------------------------------------------------------------
INSERT INTO public.product_categories (id, business_id, name, created_at, updated_at) VALUES 
-- Toko 1 (Batik Sekar Jagad)
('ca000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Tulis', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Pria', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Busana Wanita', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Aksesoris Etnik', now() - interval '90 days', now()),

-- Toko 2 (Gerabah Kasongan)
('ca000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Pot & Vas Bunga', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Guci Dekorasi', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'Peralatan Makan', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'Patung & Souvenir', now() - interval '90 days', now()),

-- Toko 3 (Bakpia Mataram 75)
('ca000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kering & Basah', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kukus', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'Gudeg & Kuliner Kaleng', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', 'Camilan Tradisional', now() - interval '90 days', now()),

-- Toko 4 (Mebel Jati Kalingga Art)
('ca000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004', 'Mebel Ruang Tamu', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000004', 'Dekorasi & Cermin', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000004', 'Perkakas Kayu Dapur', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000004', 'Aksesoris & Souvenir Kayu', now() - interval '90 days', now()),

-- Toko 5 (Bandeng Presto Juwana)
('ca000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000005', 'Bandeng Presto', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000005', 'Olahan Lauk & Tahu Bakso', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000005', 'Lumpia & Camilan Semarang', now() - interval '90 days', now()),
('ca000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000005', 'Sambal & Bumbu Khas', now() - interval '90 days', now());

-- ----------------------------------------------------------------------------
-- 5. INJEKSI 100 PRODUK KATALOG LENGKAP (public.products)
-- ----------------------------------------------------------------------------

-- A. TOKO 1: Batik Tulis Sekar Jagad (Produk 1 - 20)
INSERT INTO public.products (id, business_id, name, description, category, price, stock, min_stock, image_url, is_active, created_at, updated_at) VALUES 
('fa000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Tulis Parang Rusak Barong', 'Kain mori primissima halus dengan canting nol motif Parang Rusak Barong klasik khas Keraton Jogja.', 'Kain Batik Tulis', 850000, 3, 10, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Tulis Truntum Sri Narendra', 'Kain batik tulis bermakna cinta abadi yang bertumbuh, cocok untuk acara pernikahan adat Jawa.', 'Kain Batik Tulis', 950000, 12, 5, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Tulis Sekar Jagad Klasik Sogan', 'Mahakarya motif Sekar Jagad dengan pewarna alami kulit kayu soga dan indigofera.', 'Kain Batik Tulis', 1200000, 15, 5, 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Cap Kawung Indigofera', 'Kain batik cap tembaga motif kawung dengan pewarnaan biru indigo alami berkualitas tinggi.', 'Kain Batik Tulis', 220000, 35, 10, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Kain Batik Cap Mega Mendung Etnik', 'Kain batik kombinasi cap dan colet motif mega mendung cerah bernuansa modern.', 'Kain Batik Tulis', 240000, 40, 10, 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Batik Pria Lengan Panjang Motif Parang', 'Kemeja formal pria furing katun hero adem dengan potongan rapi dan jahitan semi-tailor.', 'Kemeja Pria', 320000, 25, 10, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Batik Pria Slim Fit Sidomukti', 'Kemeja batik modern slim fit dengan aksen motif sidomukti wibawa untuk acara resmi.', 'Kemeja Pria', 350000, 2, 10, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Batik Pria Casual Sogan Lengan Pendek', 'Kemeja batik casual lengan pendek bahan katun primissima nyaman untuk aktivitas harian.', 'Kemeja Pria', 260000, 30, 10, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Sutra Batik Tulis Eksklusif', 'Kemeja sutra ATBM eksklusif dengan lukisan canting tulis tangan edisi terbatas.', 'Kemeja Pria', 1850000, 5, 5, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'Blouse Wanita Batik Kerah Shanghai', 'Blouse batik elegan kerah mandarin dengan potongan asimetris modern untuk kerja.', 'Busana Wanita', 275000, 28, 10, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000001', 'Dress Batik Katun Kombinasi Lurik', 'Midi dress feminin kombinasi batik cap sogan dan tenun lurik khas Yogyakarta.', 'Busana Wanita', 380000, 20, 10, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000001', 'Outer Cardigan Batik Indigo Etnik', 'Cardigan longgar motif etnik batik celup indigo serbaguna untuk berbagai outfit.', 'Busana Wanita', 295000, 22, 10, 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000001', 'Tunik Batik Tulis Kontemporer', 'Tunik panjang batik tulis motif flora kontemporer dengan kancing depan tersembunyi.', 'Busana Wanita', 450000, 14, 5, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000001', 'Syal Sutra Batik Tulis Halus', 'Syal leher sutra sifon halus dengan motif batik canting warna pastel lembut.', 'Aksesoris Etnik', 185000, 45, 10, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000001', 'Totebag Batik Kombinasi Kulit Asli', 'Tas totebag jinjing kanvas motif parang dengan handle kulit sapi nabati.', 'Aksesoris Etnik', 210000, 18, 10, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000001', 'Pouch Dompet Batik Perca Etnik', 'Dompet kecil serbaguna dari perca batik tulis premium dengan resleting YKK.', 'Aksesoris Etnik', 65000, 130, 15, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000001', 'Masker Kain Batik Katun 3-Ply', 'Masker kain batik katun lapis tiga dengan filter pocket dan tali earloop elastis.', 'Aksesoris Etnik', 15000, 180, 20, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000001', 'Sarung Batik Katun Primissima Pria', 'Sarung batik cap motif kawung dan gurda khas santri nusantara bertekstur adem.', 'Aksesoris Etnik', 210000, 30, 10, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000001', 'Sajadah Batik Quilted Travel Pocket', 'Sajadah lipat praktis berlapis busa tipis dengan pouch batik elegan untuk bepergian.', 'Aksesoris Etnik', 115000, 40, 10, 'https://images.unsplash.com/photo-1584282479905-2b0e9803cb16?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000001', 'Blangkon Tradisional Jogja Mataraman', 'Blangkon mataraman lipat khas Yogyakarta dengan mondolan belakang rapi.', 'Aksesoris Etnik', 95000, 0, 8, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', true, now() - interval '90 days', now()),

-- B. TOKO 2: Studio Keramik & Gerabah Kasongan (Produk 21 - 40)
('fa000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000002', 'Vas Bunga Keramik Terracotta Minimalis', 'Vas bunga silinder tanah liat bakar warna terracotta alami untuk interior nordic.', 'Pot & Vas Bunga', 85000, 24, 10, 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000002', 'Vas Keramik Glasir Putih Silinder', 'Vas keramik stoneware finishing glossy putih bersih dengan tekstur bergaris.', 'Pot & Vas Bunga', 125000, 18, 10, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000002', 'Guci Hias Kasongan Ukir Daun 50cm', 'Guci dekorasi ruang tamu ukiran daun timbul khas pengrajin Kasongan Bantul.', 'Guci Dekorasi', 450000, 6, 5, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000002', 'Guci Naga Keramik Vintage Besar 70cm', 'Guci antik motif naga oriental lapis glasir crackle hijau toska berukuran besar.', 'Guci Dekorasi', 1250000, 2, 5, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000002', 'Pot Sukulen Mini Gerabah Set isi 3', 'Set 3 pot gerabah mini dengan lubang drainase untuk tanaman kaktus sukulen meja.', 'Pot & Vas Bunga', 45000, 150, 15, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000002', 'Pot Gantung Tanah Liat Tali Makrame', 'Pot tanaman gantung gerabah estetik dilengkapi tali anyam makrame katun kuat.', 'Pot & Vas Bunga', 75000, 35, 10, 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000027', 'b0000000-0000-0000-0000-000000000002', 'Cangkir Kopi Keramik Handmade Rustic', 'Mug keramik buatan tangan dengan gradasi warna tanah rustic kapasitas 250ml.', 'Peralatan Makan', 48000, 50, 12, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000028', 'b0000000-0000-0000-0000-000000000002', 'Set Teko Teh & 4 Cangkir Keramik Tanah Liat', 'Perangkat minum teh poci tanah liat tradisional penghasil aroma teh wangi nasgitel.', 'Peralatan Makan', 235000, 16, 8, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000029', 'b0000000-0000-0000-0000-000000000002', 'Piring Saji Keramik Etnik Bertekstur 25cm', 'Piring saji datar keramik food-grade tahan microwave dengan tepian motif lekuk.', 'Peralatan Makan', 95000, 30, 10, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000030', 'b0000000-0000-0000-0000-000000000002', 'Mangkok Ramen Keramik Hitam Doff', 'Mangkok saji dalam keramik tebal warna hitam doff elegan untuk mi dan sup panas.', 'Peralatan Makan', 65000, 40, 12, 'https://images.unsplash.com/photo-1584990347449-39908cf6b44a?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000031', 'b0000000-0000-0000-0000-000000000002', 'Tempat Lilin Aromaterapi Kasongan', 'Holder lilin keramik mini motif lubang bintang yang memancarkan siluet cahaya hangat.', 'Patung & Souvenir', 35000, 60, 10, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000032', 'b0000000-0000-0000-0000-000000000002', 'Tungku Diffuser Minyak Esensial Gerabah', 'Tungku pembakar aromaterapi gerabah alami untuk relaksasi spa dan ruang kerja.', 'Patung & Souvenir', 55000, 3, 10, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000033', 'b0000000-0000-0000-0000-000000000002', 'Patung Loro Blonyo Keramik Tradisional Sepasang', 'Sepasang patung pengantin Jawa Loro Blonyo lambang kemakmuran dan kerukunan rumah tangga.', 'Patung & Souvenir', 320000, 8, 5, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000034', 'b0000000-0000-0000-0000-000000000002', 'Patung Gajah Keramik Hias Meja', 'Patung gajah mungil berbalut lukisan batik tulis khas kerajinan cinderamata Bantul.', 'Patung & Souvenir', 110000, 20, 8, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000035', 'b0000000-0000-0000-0000-000000000002', 'Asbak Tanah Liat Motif Batik Kasongan', 'Asbak rokok gerabah tahan panas dengan ukiran motif parang melingkar di bibir asbak.', 'Patung & Souvenir', 25000, 80, 15, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000036', 'b0000000-0000-0000-0000-000000000002', 'Cobek & Ulekan Batu Andesit Asli Merapi', 'Cobek batu alam andesit padat dari lereng Merapi diameter 22cm anti pasir dan awet.', 'Peralatan Makan', 135000, 15, 8, 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000037', 'b0000000-0000-0000-0000-000000000002', 'Celengan Gerabah Semar Karakter Lukis', 'Celengan tanah liat karakter tokoh pewayangan Semar lukis tangan untuk edukasi menabung.', 'Patung & Souvenir', 30000, 120, 15, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000038', 'b0000000-0000-0000-0000-000000000002', 'Hiasan Dinding Mozaik Keramik Artistik', 'Plakat keramik mozaik hiasan dinding bertema pemandangan Candi Prambanan.', 'Patung & Souvenir', 195000, 10, 5, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000039', 'b0000000-0000-0000-0000-000000000002', 'Dispenser Air Gerabah Kendi Dingin Alami', 'Kendi air minum gerabah tanah liat kapasitas 3 liter yang menjaga air tetap sejuk alami.', 'Peralatan Makan', 140000, 0, 6, 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000040', 'b0000000-0000-0000-0000-000000000002', 'Nampan Coaster Kayu & Keramik Estetik', 'Nampan kayu jati kombinasi ubin keramik motif tegel kunci Yogyakarta.', 'Peralatan Makan', 55000, 35, 10, 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80', true, now() - interval '90 days', now()),

-- C. TOKO 3: Bakpia & Oleh-Oleh Mataram 75 (Produk 41 - 60)
INSERT INTO public.products (id, business_id, name, description, category, price, stock, min_stock, image_url, is_active, created_at, updated_at) VALUES 
('fa000000-0000-0000-0000-000000000041', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Basah Kacang Hijau Asli isi 20', 'Bakpia basah legendaris rasa kacang hijau kupas manis gurih tekstur lembut khas Jogja.', 'Bakpia Kering & Basah', 45000, 40, 15, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000042', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kering Kumbu Hitam isi 20', 'Bakpia kering isi kacang tolo hitam manis legit dengan masa simpan lebih lama.', 'Bakpia Kering & Basah', 45000, 35, 15, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000043', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kering Keju Spesial isi 20', 'Bakpia kering rasa keju cheddar gurih berpadu susu dengan kulit renyah berlapis.', 'Bakpia Kering & Basah', 52000, 50, 15, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000044', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kering Cokelat Lumer isi 20', 'Bakpia kering isi pasta cokelat pekat premium lumer di mulut favorit anak muda.', 'Bakpia Kering & Basah', 50000, 4, 15, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000045', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kering Aneka Rasa (Mix 4 Rasa)', 'Satu kotak isi komplit 4 rasa favorit: Kacang Hijau, Cokelat, Keju, dan Kumbu Hitam.', 'Bakpia Kering & Basah', 55000, 60, 20, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000046', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kukus Lembut Cokelat isi 10', 'Bakpia kukus bolu lembut isi lava cokelat lumer tebal khas oleh-oleh kekinian Jogja.', 'Bakpia Kukus', 40000, 45, 15, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000047', 'b0000000-0000-0000-0000-000000000003', 'Bakpia Kukus Keju isi 10', 'Bolu kukus pandan isi krim keju lezat dengan aroma harum dan tekstur super empuk.', 'Bakpia Kukus', 42000, 38, 15, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000048', 'b0000000-0000-0000-0000-000000000003', 'Yangko Aneka Rasa Tradisional Kotak 300g', 'Kue kenyal tepung ketan isi kacang cincang aneka aroma buah khas Kotagede.', 'Camilan Tradisional', 32000, 30, 10, 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000049', 'b0000000-0000-0000-0000-000000000003', 'Geplak Bantul Aneka Warna 500g', 'Camilan manis parutan kelapa muda dan gula pasir warna-warni khas Bantul.', 'Camilan Tradisional', 35000, 25, 10, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000050', 'b0000000-0000-0000-0000-000000000003', 'Gudeg Kaleng Yu Djum Kering Komplit', 'Gudeg nangka muda kering lengkap dengan telur bebek, suwir ayam kampung, dan krecek siap santap.', 'Gudeg & Kuliner Kaleng', 58000, 40, 12, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000051', 'b0000000-0000-0000-0000-000000000003', 'Gudeg Kaleng Sambal Goreng Krecek Pedas', 'Kalengan sambal goreng krecek kulit sapi gurih pedas siap saji tanpa bahan pengawet.', 'Gudeg & Kuliner Kaleng', 55000, 3, 12, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000052', 'b0000000-0000-0000-0000-000000000003', 'Keripik Belut Godean Gurih Renyah 250g', 'Belut sawah goreng tepung bumbu ketumbar renyah tanpa bau amis khas pasar Godean.', 'Camilan Tradisional', 48000, 30, 10, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000053', 'b0000000-0000-0000-0000-000000000003', 'Peyek Kacang Daun Jeruk Toples 400g', 'Rempeyek kacang tanah renyah dengan irisan daun jeruk wangi gurih toples kedap udara.', 'Camilan Tradisional', 38000, 28, 10, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000054', 'b0000000-0000-0000-0000-000000000003', 'Ampyang Kacang Gula Jawa Jahe 250g', 'Kacang tanah sangrai berselimut karamel gula aren dan jahe emprit hangat pedas.', 'Camilan Tradisional', 25000, 50, 15, 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000055', 'b0000000-0000-0000-0000-000000000003', 'Cokelat Monggo Dark Chocolate 80g', 'Cokelat artisan asli Jogja dengan kadar kakao 58% olahan biji cokelat petani Jawa.', 'Camilan Tradisional', 45000, 35, 10, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000056', 'b0000000-0000-0000-0000-000000000003', 'Wedang Uwuh Imogiri Celup Instan 10s', 'Minuman rempah kayu secang, jahe, cengkeh, dan kapulaga celup praktis khas Imogiri.', 'Camilan Tradisional', 28000, 140, 15, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000057', 'b0000000-0000-0000-0000-000000000003', 'Sirup Gula Asem Jawa Alami 500ml', 'Sirup sari asam jawa murni gula batu menyegarkan penurun panas dalam kemasan botol kaca.', 'Camilan Tradisional', 35000, 25, 8, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000058', 'b0000000-0000-0000-0000-000000000003', 'Kopi Merapi Robusta Sangrai Bubuk 200g', 'Kopi robusta lereng gunung Merapi petik merah aroma cokelat kacang karamel kuat.', 'Camilan Tradisional', 55000, 20, 8, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000059', 'b0000000-0000-0000-0000-000000000003', 'Emping Melinjo Pedas Manis 250g', 'Emping melinjo tipis renyah berlapis bumbu karamel cabai pedas manis gurih.', 'Camilan Tradisional', 36000, 30, 10, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000060', 'b0000000-0000-0000-0000-000000000003', 'Enting-Enting Gepuk Salatiga 200g', 'Ting-ting kacang gepuk tradisional manis renyah dibungkus kertas klobot jagung.', 'Camilan Tradisional', 30000, 0, 10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', true, now() - interval '90 days', now()),

-- D. TOKO 4: Mebel Jati & Ukiran Kalingga Art Jepara (Produk 61 - 80)
INSERT INTO public.products (id, business_id, name, description, category, price, stock, min_stock, image_url, is_active, created_at, updated_at) VALUES 
('fa000000-0000-0000-0000-000000000061', 'b0000000-0000-0000-0000-000000000004', 'Kursi Teras Jati Minimalis Set (2 Kursi + Meja)', 'Set kursi teras kayu jati TPK Perhutani tahan cuaca dengan finishing natural teak oil.', 'Mebel Ruang Tamu', 1450000, 5, 2, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000062', 'b0000000-0000-0000-0000-000000000004', 'Meja Kopi Kayu Jati Solid Natural Edge', 'Coffee table ruang tamu potongan kayu jati utuh mempertahankan lekukan alami kayu.', 'Mebel Ruang Tamu', 1850000, 4, 2, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000063', 'b0000000-0000-0000-0000-000000000004', 'Rak Dinding Ambalan Jati Rustic 80cm', 'Ambalan dinding kayu jati tebal dengan braket besi cor kokoh untuk display pajangan.', 'Dekorasi & Cermin', 195000, 20, 8, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000064', 'b0000000-0000-0000-0000-000000000004', 'Cermin Hias Frame Ukir Jepara Diameter 70cm', 'Cermin dinding bulat dengan bingkai ukiran motif dedaunan ukir tangan pengrajin Jepara.', 'Dekorasi & Cermin', 650000, 8, 3, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000065', 'b0000000-0000-0000-0000-000000000004', 'Jam Dinding Kayu Jati Ukiran Relief Mahkota', 'Jam dinding analog mesin quartz sweep silent berbalut seni pahat kayu jati mewah.', 'Dekorasi & Cermin', 480000, 6, 3, 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000066', 'b0000000-0000-0000-0000-000000000004', 'Kotak Perhiasan Kayu Jati Lapis Beludru', 'Jewelry box ukir bunga dengan sekat bertingkat lapis beludru merah dan kunci kuningan.', 'Aksesoris & Souvenir Kayu', 220000, 15, 5, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000067', 'b0000000-0000-0000-0000-000000000004', 'Kaligrafi Ayat Kursi Kayu Jati Ukir Tembus', 'Hiasan dinding kaligrafi ukiran tembus (kerawang) kayu jati 100x50cm berlapis warna emas.', 'Dekorasi & Cermin', 1200000, 1, 2, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000068', 'b0000000-0000-0000-0000-000000000004', 'Hiasan Patung Kuda Kayu Jati Solid 35cm', 'Patung pahatan kuda jingkrak dari balok jati utuh lambang ketangkasan dan kesuksesan.', 'Aksesoris & Souvenir Kayu', 380000, 7, 3, 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000069', 'b0000000-0000-0000-0000-000000000004', 'Set Talenan & Spatula Jati Food Grade', 'Talenan dapur kayu jati anti jamur polesan beeswax alami bersertifikasi food grade.', 'Perkakas Kayu Dapur', 145000, 40, 10, 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000070', 'b0000000-0000-0000-0000-000000000004', 'Piring & Mangkok Kayu Jati Estetik Set 4 Pcs', 'Set perlengkapan makan kayu jati serat indah terdiri dari 2 piring saji dan 2 mangkok sup.', 'Perkakas Kayu Dapur', 185000, 25, 8, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000071', 'b0000000-0000-0000-0000-000000000004', 'Nampan Saji Kayu Jati Handle Kuningan', 'Nampan saji hidangan tamu kayu jati kokoh 40x25cm dengan pegangan kuningan antik.', 'Perkakas Kayu Dapur', 165000, 30, 8, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000072', 'b0000000-0000-0000-0000-000000000004', 'Coaster Tatakan Gelas Kayu Jati Set isi 6', 'Tatakan gelas kayu jati bundar dengan box penyimpan mungil untuk meja cafe dan kantor.', 'Perkakas Kayu Dapur', 65000, 90, 12, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000073', 'b0000000-0000-0000-0000-000000000004', 'Stand Laptop Ergonomis Kayu Jati', 'Dudukan laptop portabel kayu jati penyejuk sirkulasi udara dengan sudut kemiringan ideal.', 'Aksesoris & Souvenir Kayu', 135000, 35, 10, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000074', 'b0000000-0000-0000-0000-000000000004', 'Organizer Meja Kantor Kayu Jati Slot HP & Pena', 'Tempat alat tulis, kartu nama, dan docking handphone dari kayu jati minimalis.', 'Aksesoris & Souvenir Kayu', 115000, 28, 8, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000075', 'b0000000-0000-0000-0000-000000000004', 'Kotak Tisu Kayu Jati Ukiran Bunga Klasik', 'Tempat tisu meja kayu jati bukaan bawah dengan ukiran bunga melati khas Jepara.', 'Dekorasi & Cermin', 125000, 22, 8, 'https://images.unsplash.com/photo-1584990347449-39908cf6b44a?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000076', 'b0000000-0000-0000-0000-000000000004', 'Asbak Kayu Jati Solid Tahan Panas', 'Asbak meja rokok dari kayu jati solid bertekstur tebal dilengkapi alur penahan rokok.', 'Aksesoris & Souvenir Kayu', 55000, 45, 10, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000077', 'b0000000-0000-0000-0000-000000000004', 'Tempat Payung Kayu Jati Anyaman Estetik', 'Wadah payung berdiri kayu jati kombinasi rotan untuk foyer dan teras depan rumah.', 'Mebel Ruang Tamu', 320000, 6, 3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000078', 'b0000000-0000-0000-0000-000000000004', 'Kapstok Gantungan Baju Dinding Jati 5 Kait', 'Gantungan jaket topi dinding kayu jati papan solid dengan 5 pasang kait besi tempa.', 'Dekorasi & Cermin', 140000, 18, 6, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000079', 'b0000000-0000-0000-0000-000000000004', 'Sekat Ruangan / Sketsel Ukir Jepara 3 Daun', 'Partisi penyekat ruangan lipat 3 panel ukiran motif ukir gebyok khas keraton.', 'Mebel Ruang Tamu', 2900000, 1, 2, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000080', 'b0000000-0000-0000-0000-000000000004', 'Meja Makan Jati Trembesi Utuh + 6 Kursi', 'Dining table mewah papan kayu suar/trembesi utuh tebal 8cm lengkap dengan 6 kursi makan.', 'Mebel Ruang Tamu', 5800000, 0, 1, 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=80', true, now() - interval '90 days', now()),

-- E. TOKO 5: Bandeng Presto Juwana Asli Semarang (Produk 81 - 100)
INSERT INTO public.products (id, business_id, name, description, category, price, stock, min_stock, image_url, is_active, created_at, updated_at) VALUES 
('fa000000-0000-0000-0000-000000000081', 'b0000000-0000-0000-0000-000000000005', 'Bandeng Presto Duri Lunak Vakum Basah isi 2', 'Bandeng presto bumbu rempah kuning duri lunak kemasan vakum steril tahan 3 bulan.', 'Bandeng Presto', 75000, 35, 12, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000082', 'b0000000-0000-0000-0000-000000000005', 'Bandeng Presto Goreng Telur Renyah isi 2', 'Bandeng duri lunak yang sudah dibalut telur gurih dan digoreng garing siap santap.', 'Bandeng Presto', 80000, 28, 10, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000083', 'b0000000-0000-0000-0000-000000000005', 'Bandeng Asap Semarang Gurih Wangi isi 1', 'Bandeng asap aroma kayu kelapa pilihan dengan daging padat gurih bebas bau tanah.', 'Bandeng Presto', 85000, 20, 8, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000084', 'b0000000-0000-0000-0000-000000000005', 'Otak-Otak Bandeng Panggang Rempah isi 2', 'Daging bandeng cincang dibumbui santan kelapa dan telur dimasukkan kembali ke kulit ikan.', 'Olahan Lauk & Tahu Bakso', 78000, 25, 10, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000085', 'b0000000-0000-0000-0000-000000000005', 'Bandeng Boneless Tanpa Duri Segar 500g', 'Fillet daging ikan bandeng segar cabut duri higienis siap olah untuk berbagai masakan.', 'Bandeng Presto', 68000, 30, 10, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000086', 'b0000000-0000-0000-0000-000000000005', 'Lumpia Semarang Goreng Rebung Udang isi 5', 'Lumpia goreng kulit renyah isi tumisan rebung muda manis, udang segar, dan telur ayam.', 'Lumpia & Camilan Semarang', 70000, 3, 15, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000087', 'b0000000-0000-0000-0000-000000000005', 'Lumpia Semarang Basah Original isi 5', 'Lumpia basah khas jalan Mataram disajikan lengkap dengan saus kental bawang putih dan cabai rawit.', 'Lumpia & Camilan Semarang', 70000, 20, 10, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000088', 'b0000000-0000-0000-0000-000000000005', 'Tahu Bakso Sapi Ungaran Kukus Kotak isi 10', 'Tahu pong cokelat lembut isi adonan daging sapi cincang padat gurih tanpa pengawet.', 'Olahan Lauk & Tahu Bakso', 48000, 40, 12, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000089', 'b0000000-0000-0000-0000-000000000005', 'Tahu Bakso Sapi Goreng Renyah Kotak isi 10', 'Tahu bakso sapi yang sudah digoreng garing keemasan nikmat untuk lauk atau camilan.', 'Olahan Lauk & Tahu Bakso', 50000, 35, 12, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000090', 'b0000000-0000-0000-0000-000000000005', 'Abon Ikan Bandeng Super Gurih 200g', 'Abon serat daging bandeng murni kaya protein gurih renyah teman nasi hangat.', 'Olahan Lauk & Tahu Bakso', 45000, 50, 15, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000091', 'b0000000-0000-0000-0000-000000000005', 'Kerupuk Tulang Bandeng Tinggi Kalsium 150g', 'Kerupuk olahan tulang lunak bandeng yang renyah kaya kalsium alami.', 'Olahan Lauk & Tahu Bakso', 25000, 130, 15, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000092', 'b0000000-0000-0000-0000-000000000005', 'Stik Duri Bandeng Renyah Balado 150g', 'Camilan stik gurih bumbu balado pedas manis hasil inovasi olahan duri ikan.', 'Lumpia & Camilan Semarang', 28000, 60, 12, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000093', 'b0000000-0000-0000-0000-000000000005', 'Sambal Bajak Bandeng Juwana Botol 200g', 'Sambal terasi goreng khas pesisir Juwana pendamping setia bandeng goreng.', 'Sambal & Bumbu Khas', 32000, 45, 15, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000094', 'b0000000-0000-0000-0000-000000000005', 'Sambal Matah Kecombrang Segar Botol 200g', 'Sambal iris rempah kecombrang wangi segar dengan minyak kelapa asli.', 'Sambal & Bumbu Khas', 35000, 30, 10, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000095', 'b0000000-0000-0000-0000-000000000005', 'Terasi Udang Juwana Asli Wangi 250g', 'Terasi rebon udang laut Juwana kualitas ekspor penambah sedap segala masakan.', 'Sambal & Bumbu Khas', 28000, 40, 10, 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000096', 'b0000000-0000-0000-0000-000000000005', 'Petis Udang Semarang Kental Gurih 250g', 'Petis udang manis pekat khas pesisir Semarang untuk bumbu tahu pong dan rujak cingur.', 'Sambal & Bumbu Khas', 30000, 35, 10, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000097', 'b0000000-0000-0000-0000-000000000005', 'Wingko Babat Semarang Aneka Rasa isi 20', 'Kue kelapa muda bakar ketan wangi rasa original kelapa, cokelat, dan nangka.', 'Lumpia & Camilan Semarang', 45000, 32, 10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000098', 'b0000000-0000-0000-0000-000000000005', 'Moaci Gemini Kenyal Wijen isi 16', 'Kue mochi kenyal isi kacang tanah manis bertabur biji wijen harum khas Semarang.', 'Lumpia & Camilan Semarang', 48000, 25, 10, 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000099', 'b0000000-0000-0000-0000-000000000005', 'Roti Ganjel Rel Kayu Manis Tradisional', 'Roti cokelat padat rempah kayu manis dan cengkeh bertabur wijen resep kuno tempo doeloe.', 'Lumpia & Camilan Semarang', 38000, 2, 8, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', true, now() - interval '90 days', now()),
('fa000000-0000-0000-0000-000000000100', 'b0000000-0000-0000-0000-000000000005', 'Pempek Bandeng Kuah Cuko Kental', 'Inovasi pempek daging ikan bandeng gurih disajikan dengan kuah cuko gula batok pedas.', 'Olahan Lauk & Tahu Bakso', 65000, 0, 8, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80', true, now() - interval '90 days', now());

-- ----------------------------------------------------------------------------
-- 6. INJEKSI MASTER DATA EVENT BUDAYA & PARIWISATA DIY-JATENG 2026
-- ----------------------------------------------------------------------------
INSERT INTO public.local_events (id, title, province_name, city_name, start_date, end_date, description, expected_tourist_impact, created_at) VALUES 
('ea000000-0000-0000-0000-000000000001', 'Upacara Adat Sekaten Yogyakarta 2026', 'DI Yogyakarta', 'Kota Yogyakarta', '2026-09-15', '2026-09-22', 'Pasar malam rakyat dan perayaan Grebeg Maulud tahunan di Alun-Alun Utara Kraton Yogyakarta.', 'massive', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000002', 'Dieng Culture Festival (DCF) 2026', 'Jawa Tengah', 'Kabupaten Banjarnegara', '2026-08-20', '2026-08-23', 'Ritual pemotongan rambut gimbal anak dataran tinggi Dieng dan festival lampion malam.', 'massive', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000003', 'Solo Batik Carnival 2026', 'Jawa Tengah', 'Kota Surakarta', '2026-10-02', '2026-10-04', 'Karnaval kostum batik raksasa di sepanjang Jalan Slamet Riyadi Solo memperingati Hari Batik Nasional.', 'high', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000004', 'ARTJOG Contemporary Art Fair 2026', 'DI Yogyakarta', 'Kabupaten Bantul', '2026-07-01', '2026-08-31', 'Pameran seni rupa kontemporer terbesar se-Asia Tenggara di Jogja National Museum.', 'high', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000005', 'Festival Kota Lama Semarang 2026', 'Jawa Tengah', 'Kota Semarang', '2026-09-08', '2026-09-18', 'Pentas seni budaya, kuliner tempo doeloe, dan pasar antik di kawasan cagar budaya Kota Lama.', 'high', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000006', 'Borobudur Marathon & Cultural Week 2026', 'Jawa Tengah', 'Kabupaten Magelang', '2026-11-14', '2026-11-16', 'Ajang lari marathon internasional yang melintasi pedesaan dan panorama Candi Borobudur.', 'massive', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000007', 'Festival Payung Indonesia (Fespin) 2026', 'Jawa Tengah', 'Kota Surakarta', '2026-09-04', '2026-09-06', 'Festival payung tradisional nusantara di Pura Mangkunegaran Surakarta.', 'medium', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000008', 'Yogyakarta Gamelan Festival (YGF) 2026', 'DI Yogyakarta', 'Kota Yogyakarta', '2026-08-05', '2026-08-09', 'Temu musisi dan pementasan gamelan kontemporer dari musisi lintas negara.', 'medium', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000009', 'Grebeg Besar Demak 2026', 'Jawa Tengah', 'Kabupaten Demak', '2026-06-16', '2026-06-18', 'Prosesi ziarah dan iring-iringan prajurit patangpuluhan di Masjid Agung Demak.', 'high', now() - interval '90 days'),
('ea000000-0000-0000-0000-000000000010', 'Pekan Budaya Tionghoa Yogyakarta (PBTY)', 'DI Yogyakarta', 'Kota Yogyakarta', '2026-03-01', '2026-03-05', 'Karnaval naga liong dan festival kuliner Cap Go Meh di Kampung Ketandan Malioboro.', 'high', now() - interval '90 days');

-- ----------------------------------------------------------------------------
-- 7. INJEKSI KUPON VOUCHER PROMO (public.vouchers)
-- ----------------------------------------------------------------------------
INSERT INTO public.vouchers (
  id, business_id, code, discount_type, discount_value, target_segment, 
  min_order_amount, usage_limit, times_used, is_active, starts_at, expires_at, created_at
) VALUES 
('ba000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'SEKATEN20', 'percent', 20, 'champions', 300000, 100, 14, true, now() - interval '30 days', now() + interval '60 days', now() - interval '30 days'),
('ba000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'KANGENBELANJA15', 'fixed', 15000, 'at_risk', 100000, 150, 8, true, now() - interval '30 days', now() + interval '60 days', now() - interval '30 days'),
('ba000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'PROMOHEMAT', 'fixed', 10000, 'all', 50000, 500, 42, true, now() - interval '60 days', now() + interval '90 days', now() - interval '60 days'),

('ba000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'KASONGAN10', 'percent', 10, 'loyal', 150000, 100, 12, true, now() - interval '30 days', now() + interval '60 days', now() - interval '30 days'),
('ba000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'BAKPIAJUARA', 'fixed', 10000, 'champions', 100000, 200, 35, true, now() - interval '45 days', now() + interval '60 days', now() - interval '45 days'),
('ba000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 'JATIKALIN15', 'percent', 15, 'champions', 1000000, 50, 6, true, now() - interval '45 days', now() + interval '60 days', now() - interval '45 days'),
('ba000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 'JUWANAFRESH', 'fixed', 15000, 'all', 150000, 150, 26, true, now() - interval '45 days', now() + interval '60 days', now() - interval '45 days');

-- ----------------------------------------------------------------------------
-- 8. INJEKSI NOTIFIKASI SISTEM & STOK MENIPIS (public.notifications)
-- ----------------------------------------------------------------------------
INSERT INTO public.notifications (id, business_id, title, message, type, is_read, created_at) VALUES 
('da000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '⚠️ Peringatan Reorder Point (ROP)', 'Stok produk "Kain Batik Tulis Parang Rusak Barong" tersisa 3 pcs (di bawah batas minimum 10 pcs). Segera lakukan restock produksi.', 'warning', false, now() - interval '2 hours'),
('da000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '📦 Pesanan Baru Masuk', 'Pesanan #ORD-2026-089 dari Raden Mas Danang Kusuma telah dibayar via QRIS dan menunggu diproses.', 'info', false, now() - interval '4 hours'),
('da000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '🎉 Rekor Penjualan Harian', 'Toko Anda mencatatkan 8 pesanan selesai dalam 24 jam terakhir menyambut perayaan Sekaten Jogja.', 'success', true, now() - interval '1 day'),

('da000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', '⚠️ Peringatan Stok Kritis', 'Stok produk "Tungku Diffuser Minyak Esensial Gerabah" tersisa 3 pcs (batas aman ROP: 10 pcs).', 'warning', false, now() - interval '3 hours'),
('da000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', '⚠️ Peringatan ROP Bakpia Cokelat', 'Stok produk "Bakpia Kering Cokelat Lumer isi 20" tersisa 4 pcs (batas aman ROP: 15 pcs).', 'warning', false, now() - interval '5 hours');

-- ----------------------------------------------------------------------------
-- 9. INJEKSI ANALITIK ETALASE TOKO 30 HARI (public.storefront_analytics)
-- ----------------------------------------------------------------------------
INSERT INTO public.storefront_analytics (business_id, date, page_impressions, product_clicks, qris_checkouts, created_at)
SELECT 
  'b0000000-0000-0000-0000-000000000001'::uuid,
  (CURRENT_DATE - i)::date,
  (40 + (random() * 60)::int + (CASE WHEN i <= 7 THEN 30 ELSE 0 END)),
  (15 + (random() * 30)::int + (CASE WHEN i <= 7 THEN 15 ELSE 0 END)),
  (2 + (random() * 6)::int),
  (now() - (i || ' days')::interval)
FROM generate_series(0, 30) AS i;

INSERT INTO public.storefront_analytics (business_id, date, page_impressions, product_clicks, qris_checkouts, created_at)
SELECT 
  'b0000000-0000-0000-0000-000000000002'::uuid,
  (CURRENT_DATE - i)::date,
  (25 + (random() * 40)::int),
  (10 + (random() * 20)::int),
  (1 + (random() * 4)::int),
  (now() - (i || ' days')::interval)
FROM generate_series(0, 30) AS i;

INSERT INTO public.storefront_analytics (business_id, date, page_impressions, product_clicks, qris_checkouts, created_at)
SELECT 
  'b0000000-0000-0000-0000-000000000003'::uuid,
  (CURRENT_DATE - i)::date,
  (50 + (random() * 70)::int),
  (20 + (random() * 35)::int),
  (3 + (random() * 8)::int),
  (now() - (i || ' days')::interval)
FROM generate_series(0, 30) AS i;

-- ----------------------------------------------------------------------------
-- 10. GENERATOR ~250 TRANSAKSI REALISTIS 90 HARI (public.orders & public.order_items)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  v_order_id UUID;
  v_buyer_id UUID;
  v_business_id UUID;
  v_prod_id UUID;
  v_prod_price NUMERIC;
  v_order_date TIMESTAMPTZ;
  v_status TEXT;
  v_pay_status TEXT;
  v_qty INT;
  v_total NUMERIC;
  v_short_id TEXT;
  v_order_num INT := 100;
  v_buyer_ids UUID[] := ARRAY[
    -- Champions (1 - 5)
    'cb000000-0000-0000-0000-000000000001'::uuid, 'cb000000-0000-0000-0000-000000000002'::uuid, 
    'cb000000-0000-0000-0000-000000000003'::uuid, 'cb000000-0000-0000-0000-000000000004'::uuid, 
    'cb000000-0000-0000-0000-000000000005'::uuid,
    -- Loyal (6 - 11)
    'cb000000-0000-0000-0000-000000000006'::uuid, 'cb000000-0000-0000-0000-000000000007'::uuid,
    'cb000000-0000-0000-0000-000000000008'::uuid, 'cb000000-0000-0000-0000-000000000009'::uuid,
    'cb000000-0000-0000-0000-000000000010'::uuid, 'cb000000-0000-0000-0000-000000000011'::uuid,
    -- Potential (12 - 17)
    'cb000000-0000-0000-0000-000000000012'::uuid, 'cb000000-0000-0000-0000-000000000013'::uuid,
    'cb000000-0000-0000-0000-000000000014'::uuid, 'cb000000-0000-0000-0000-000000000015'::uuid,
    'cb000000-0000-0000-0000-000000000016'::uuid, 'cb000000-0000-0000-0000-000000000017'::uuid,
    -- At Risk (18 - 23)
    'cb000000-0000-0000-0000-000000000018'::uuid, 'cb000000-0000-0000-0000-000000000019'::uuid,
    'cb000000-0000-0000-0000-000000000020'::uuid, 'cb000000-0000-0000-0000-000000000021'::uuid,
    'cb000000-0000-0000-0000-000000000022'::uuid, 'cb000000-0000-0000-0000-000000000023'::uuid,
    -- New Customers (24 - 27)
    'cb000000-0000-0000-0000-000000000024'::uuid, 'cb000000-0000-0000-0000-000000000025'::uuid,
    'cb000000-0000-0000-0000-000000000026'::uuid, 'cb000000-0000-0000-0000-000000000027'::uuid,
    -- Lost (28 - 30)
    'cb000000-0000-0000-0000-000000000028'::uuid, 'cb000000-0000-0000-0000-000000000029'::uuid,
    'cb000000-0000-0000-0000-000000000030'::uuid
  ];
  v_biz_ids UUID[] := ARRAY[
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'b0000000-0000-0000-0000-000000000003'::uuid,
    'b0000000-0000-0000-0000-000000000004'::uuid,
    'b0000000-0000-0000-0000-000000000005'::uuid
  ];
  i INT;
  day_offset INT;
BEGIN

  -- 1. Transaksi untuk Champions (5 User: Masing-masing 7 pesanan tersebar dari 85 hari s.d. 2 hari lalu)
  FOR u IN 1..5 LOOP
    v_buyer_id := v_buyer_ids[u];
    FOR order_idx IN 1..7 LOOP
      v_order_num := v_order_num + 1;
      v_order_id := gen_random_uuid();
      v_business_id := v_biz_ids[1 + ((u + order_idx) % 5)];
      
      -- Tanggal belanja (semakin akhir semakin baru)
      day_offset := (80 - (order_idx * 11) + (random() * 3)::int);
      IF day_offset < 1 THEN day_offset := 1; END IF;
      v_order_date := now() - (day_offset || ' days')::interval - ((random() * 8)::int || ' hours')::interval;

      -- Ambil produk dari toko terkait
      SELECT id, price INTO v_prod_id, v_prod_price 
      FROM public.products 
      WHERE business_id = v_business_id AND is_active = true AND stock > 0
      ORDER BY random() LIMIT 1;

      IF v_prod_id IS NOT NULL THEN
        v_qty := 1 + (random() * 2)::int;
        v_total := v_prod_price * v_qty;
        v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

        -- Tentukan status
        IF day_offset <= 1 AND order_idx = 7 THEN
          v_status := 'processing';
          v_pay_status := 'paid';
        ELSIF day_offset <= 2 AND order_idx = 7 THEN
          v_status := 'verifying';
          v_pay_status := 'paid';
        ELSE
          v_status := 'completed';
          v_pay_status := 'paid';
        END IF;

        INSERT INTO public.orders (
          id, customer_id, business_id, total_amount, order_status, payment_status,
          payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
        ) VALUES (
          v_order_id, v_buyer_id, v_business_id, v_total, v_status, v_pay_status,
          'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
          upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '15 minutes'
        );

        INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
        VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
      END IF;
    END LOOP;
  END LOOP;

  -- 2. Transaksi untuk Loyal Customers (6 User: Masing-masing 4 pesanan dari 80 hari s.d. 12 hari lalu)
  FOR u IN 6..11 LOOP
    v_buyer_id := v_buyer_ids[u];
    FOR order_idx IN 1..4 LOOP
      v_order_num := v_order_num + 1;
      v_order_id := gen_random_uuid();
      v_business_id := v_biz_ids[1 + ((u + order_idx) % 5)];
      
      day_offset := (75 - (order_idx * 16) + (random() * 4)::int);
      IF day_offset < 10 THEN day_offset := 10 + (random() * 4)::int; END IF;
      v_order_date := now() - (day_offset || ' days')::interval;

      SELECT id, price INTO v_prod_id, v_prod_price 
      FROM public.products 
      WHERE business_id = v_business_id AND is_active = true AND stock > 0
      ORDER BY random() LIMIT 1;

      IF v_prod_id IS NOT NULL THEN
        v_qty := 1 + (random() * 2)::int;
        v_total := v_prod_price * v_qty;
        v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

        INSERT INTO public.orders (
          id, customer_id, business_id, total_amount, order_status, payment_status,
          payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
        ) VALUES (
          v_order_id, v_buyer_id, v_business_id, v_total, 'completed', 'paid',
          'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
          upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '20 minutes'
        );

        INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
        VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
      END IF;
    END LOOP;
  END LOOP;

  -- 3. Transaksi untuk Potential Loyalists (6 User: Masing-masing 2-3 pesanan)
  FOR u IN 12..17 LOOP
    v_buyer_id := v_buyer_ids[u];
    FOR order_idx IN 1..3 LOOP
      v_order_num := v_order_num + 1;
      v_order_id := gen_random_uuid();
      v_business_id := v_biz_ids[1 + ((u + order_idx) % 5)];
      
      day_offset := (45 - (order_idx * 10) + (random() * 3)::int);
      IF day_offset < 15 THEN day_offset := 15 + (random() * 5)::int; END IF;
      v_order_date := now() - (day_offset || ' days')::interval;

      SELECT id, price INTO v_prod_id, v_prod_price 
      FROM public.products 
      WHERE business_id = v_business_id AND is_active = true AND stock > 0
      ORDER BY random() LIMIT 1;

      IF v_prod_id IS NOT NULL THEN
        v_qty := 1 + (random() * 2)::int;
        v_total := v_prod_price * v_qty;
        v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

        INSERT INTO public.orders (
          id, customer_id, business_id, total_amount, order_status, payment_status,
          payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
        ) VALUES (
          v_order_id, v_buyer_id, v_business_id, v_total, 'completed', 'paid',
          'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
          upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '20 minutes'
        );

        INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
        VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
      END IF;
    END LOOP;
  END LOOP;

  -- 4. Transaksi untuk At-Risk (6 User: Masing-masing 3 pesanan lama > 50 hari lalu)
  FOR u IN 18..23 LOOP
    v_buyer_id := v_buyer_ids[u];
    FOR order_idx IN 1..3 LOOP
      v_order_num := v_order_num + 1;
      v_order_id := gen_random_uuid();
      v_business_id := v_biz_ids[1 + ((u + order_idx) % 5)];
      
      day_offset := (88 - (order_idx * 11) + (random() * 3)::int);
      IF day_offset < 50 THEN day_offset := 50 + (random() * 5)::int; END IF;
      v_order_date := now() - (day_offset || ' days')::interval;

      SELECT id, price INTO v_prod_id, v_prod_price 
      FROM public.products 
      WHERE business_id = v_business_id AND is_active = true AND stock > 0
      ORDER BY random() LIMIT 1;

      IF v_prod_id IS NOT NULL THEN
        v_qty := 1;
        v_total := v_prod_price * v_qty;
        v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

        INSERT INTO public.orders (
          id, customer_id, business_id, total_amount, order_status, payment_status,
          payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
        ) VALUES (
          v_order_id, v_buyer_id, v_business_id, v_total, 'completed', 'paid',
          'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
          upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '20 minutes'
        );

        INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
        VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
      END IF;
    END LOOP;
  END LOOP;

  -- 5. Transaksi untuk New Customers (4 User: 1 pesanan dalam 1-5 hari terakhir)
  FOR u IN 24..27 LOOP
    v_buyer_id := v_buyer_ids[u];
    v_order_num := v_order_num + 1;
    v_order_id := gen_random_uuid();
    v_business_id := v_biz_ids[1 + (u % 5)];
    day_offset := (u - 23);
    v_order_date := now() - (day_offset || ' days')::interval - interval '3 hours';

    SELECT id, price INTO v_prod_id, v_prod_price 
    FROM public.products 
    WHERE business_id = v_business_id AND is_active = true AND stock > 0
    ORDER BY random() LIMIT 1;

    IF v_prod_id IS NOT NULL THEN
      v_qty := 1 + (random() * 2)::int;
      v_total := v_prod_price * v_qty;
      v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

      -- Variasi status pesanan baru
      IF day_offset = 1 THEN
        v_status := 'ready_for_pickup';
        v_pay_status := 'paid';
      ELSIF day_offset = 2 THEN
        v_status := 'processing';
        v_pay_status := 'paid';
      ELSE
        v_status := 'completed';
        v_pay_status := 'paid';
      END IF;

      INSERT INTO public.orders (
        id, customer_id, business_id, total_amount, order_status, payment_status,
        payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
      ) VALUES (
        v_order_id, v_buyer_id, v_business_id, v_total, v_status, v_pay_status,
        'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
        upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '10 minutes'
      );

      INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
      VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
    END IF;
  END LOOP;

  -- 6. Transaksi untuk Lost / Inactive (3 User: 1 pesanan > 80 hari lalu)
  FOR u IN 28..30 LOOP
    v_buyer_id := v_buyer_ids[u];
    v_order_num := v_order_num + 1;
    v_order_id := gen_random_uuid();
    v_business_id := v_biz_ids[1 + (u % 5)];
    day_offset := 82 + (u - 27);
    v_order_date := now() - (day_offset || ' days')::interval;

    SELECT id, price INTO v_prod_id, v_prod_price 
    FROM public.products 
    WHERE business_id = v_business_id AND is_active = true AND stock > 0
    ORDER BY random() LIMIT 1;

    IF v_prod_id IS NOT NULL THEN
      v_qty := 1;
      v_total := v_prod_price * v_qty;
      v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

      INSERT INTO public.orders (
        id, customer_id, business_id, total_amount, order_status, payment_status,
        payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
      ) VALUES (
        v_order_id, v_buyer_id, v_business_id, v_total, 'completed', 'paid',
        'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
        upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '10 minutes'
      );

      INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
      VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
    END IF;
  END LOOP;

  -- 7. Tambahan ~150 Transaksi Organik Harian (Menghasilkan Kurva Pendapatan Halus 90 Hari)
  FOR d IN 1..90 LOOP
    -- Jumlah order per hari (1 sampai 4 order, lebih banyak saat weekend / 7 hari terakhir)
    FOR o IN 1..(1 + (random() * (CASE WHEN d <= 14 THEN 4 ELSE 2 END))::int) LOOP
      v_order_num := v_order_num + 1;
      v_order_id := gen_random_uuid();
      v_business_id := v_biz_ids[1 + ((d + o) % 5)];
      v_buyer_id := v_buyer_ids[1 + ((d * 3 + o) % 30)];
      v_order_date := now() - (d || ' days')::interval - ((random() * 12)::int || ' hours')::interval;

      SELECT id, price INTO v_prod_id, v_prod_price 
      FROM public.products 
      WHERE business_id = v_business_id AND is_active = true AND stock > 0
      ORDER BY random() LIMIT 1;

      IF v_prod_id IS NOT NULL THEN
        v_qty := 1 + (random() * 2)::int;
        v_total := v_prod_price * v_qty;
        v_short_id := 'ORD-' || to_char(v_order_date, 'YYYYMMDD') || '-' || LPAD(v_order_num::text, 4, '0');

        -- Sebagian kecil order terbaru dibuat pending/processing untuk pengujian
        IF d = 0 AND o = 1 THEN
          v_status := 'pending';
          v_pay_status := 'pending';
        ELSIF d <= 1 AND o = 2 THEN
          v_status := 'processing';
          v_pay_status := 'paid';
        ELSE
          v_status := 'completed';
          v_pay_status := 'paid';
        END IF;

        INSERT INTO public.orders (
          id, customer_id, business_id, total_amount, order_status, payment_status,
          payment_method, temanqris_transaction_id, short_id, wa_token, created_at, updated_at
        ) VALUES (
          v_order_id, v_buyer_id, v_business_id, v_total, v_status, v_pay_status,
          'qris', 'TQ-' || upper(substr(md5(random()::text), 1, 10)), v_short_id,
          upper(substr(md5(random()::text), 1, 8)), v_order_date, v_order_date + interval '15 minutes'
        );

        INSERT INTO public.order_items (id, order_id, product_id, quantity, price_per_item, created_at, updated_at)
        VALUES (gen_random_uuid(), v_order_id, v_prod_id, v_qty, v_prod_price, v_order_date, v_order_date);
      END IF;
    END LOOP;
  END LOOP;

END $$;

-- Selesai Seed Data Komprehensif LORA
