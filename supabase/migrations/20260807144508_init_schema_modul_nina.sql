-- 1. Tabel profiles (Multi-Role: Buyer, Seller, Admin)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text not null,
  phone_number text,
  avatar_url text,
  is_buyer boolean default false,
  is_seller boolean default false,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel businesses (Etalase dengan format API Wilayah)
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null, 
  description text,
  province_id text,
  province_name text,
  city_id text,
  city_name text,
  district_id text,
  district_name text,
  village_id text,
  village_name text,
  postal_code text,
  address text, 
  google_maps_link text, 
  contact_number text, 
  logo_url text, 
  banner_url text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel products (Inventori toko)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  description text,
  category text,
  price numeric not null default 0,
  stock integer not null default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel orders (Transaksi dengan TemanQris)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  total_amount numeric not null,
  order_status text default 'pending' check (order_status in ('pending', 'processing', 'completed', 'cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'expired')),
  payment_method text default 'qris',
  temanqris_transaction_id text, 
  temanqris_qr_code text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel order_items (Detail barang di dalam transaksi)
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price_per_item numeric not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);