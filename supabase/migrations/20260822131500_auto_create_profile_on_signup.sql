-- 1. Buat fungsi trigger untuk otomatis menyalin user baru dari auth.users ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone_number, 
    avatar_url, 
    is_buyer, 
    is_seller, 
    is_admin
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1),
      'Pengguna LORA'
    ),
    NULLIF(TRIM(new.raw_user_meta_data->>'phone_number'), ''),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url', 
      new.raw_user_meta_data->>'picture', 
      null
    ),
    true,   -- Default sebagai Pembeli
    false,  -- Bukan seller
    false   -- Bukan admin
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Pasang trigger pada tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Sinkronisasi (Mass Backfill) seluruh pengguna auth.users yang belum memiliki baris profil
INSERT INTO public.profiles (
  id, 
  full_name, 
  phone_number, 
  avatar_url, 
  is_buyer, 
  is_seller, 
  is_admin
)
SELECT 
  au.id, 
  COALESCE(
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'name', 
    split_part(au.email, '@', 1),
    'Pengguna LORA'
  ) AS full_name,
  NULLIF(TRIM(au.raw_user_meta_data->>'phone_number'), '') AS phone_number,
  COALESCE(
    au.raw_user_meta_data->>'avatar_url', 
    au.raw_user_meta_data->>'picture', 
    null
  ) AS avatar_url,
  true AS is_buyer,
  false AS is_seller,
  false AS is_admin
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
