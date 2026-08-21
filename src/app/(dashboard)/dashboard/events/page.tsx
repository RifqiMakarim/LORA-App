import { createClient } from '@/lib/supabase/server';
import EventsClient from '@/components/dashboard/EventsClient';

export const revalidate = 0; // Disable cache to fetch fresh events data

export const metadata = {
  title: 'Event & Tren Daerah | LORA Seller Centre',
  description: 'Kalender event kebudayaan & pariwisata daerah DIY dan Jawa Tengah untuk antisipasi lonjakan permintaan toko.',
};

export default async function EventsOverviewPage() {
  const supabase = await createClient();

  // 1. Verifikasi User Sesi
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let businessProvince: string | null = null;
  let businessName: string | null = null;

  if (user) {
    // Ambil Profil untuk Cek Admin Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    
    isAdmin = !!profile?.is_admin;

    // Ambil Provinsi Bisnis
    const { data: business } = await supabase
      .from('businesses')
      .select('name, province_name')
      .eq('owner_id', user.id)
      .maybeSingle();

  if (business) {
    businessProvince = business.province_name;
    businessName = business.name;
  }
}

  // 2. Fetch Master Event
  const { data: rawEvents } = await supabase
    .from('local_events')
    .select('*')
    .order('start_date', { ascending: true });

  const events = (rawEvents || []).map(e => ({
    id: e.id,
    title: e.title,
    province_name: e.province_name,
    city_name: e.city_name,
    start_date: e.start_date,
    end_date: e.end_date,
    expected_tourist_impact: e.expected_tourist_impact || 'medium',
    description: e.description,
  }));

  return (
    <EventsClient
      events={events}
      isAdmin={isAdmin}
      businessProvince={businessProvince}
      businessName={businessName}
    />
  );
}
