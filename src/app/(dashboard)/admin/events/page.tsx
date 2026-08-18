import { createClient } from '@/lib/supabase/server';
import AdminEventsClient from '@/components/dashboard/AdminEventsClient';

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Fetch all events
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
    description: e.description,
    expected_tourist_impact: e.expected_tourist_impact || 'medium',
  }));

  return <AdminEventsClient events={events} />;
}
