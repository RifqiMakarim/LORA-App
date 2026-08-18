import { createClient } from '@/lib/supabase/server';
import AdminUsersStoresClient from '@/components/dashboard/AdminUsersStoresClient';

export default async function AdminUsersStoresPage() {
  const supabase = await createClient();

  // Fetch all profiles
  const { data: rawProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const profiles = (rawProfiles || []).map(p => ({
    id: p.id,
    fullName: p.full_name,
    phone: p.phone_number || '-',
    isBuyer: p.is_buyer,
    isSeller: p.is_seller,
    isAdmin: p.is_admin,
    createdAt: p.created_at,
  }));

  // Fetch all businesses
  const { data: rawBusinesses } = await supabase
    .from('businesses')
    .select('id, name, slug, province_name, city_name, contact_number, created_at, profiles(full_name)')
    .order('created_at', { ascending: false });

  const businesses = (rawBusinesses || []).map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    province: b.province_name || '-',
    city: b.city_name || '-',
    contact: b.contact_number || '-',
    ownerName: (b.profiles as any)?.full_name || 'Pemilik Toko',
    createdAt: b.created_at,
  }));

  return <AdminUsersStoresClient profiles={profiles} businesses={businesses} />;
}
