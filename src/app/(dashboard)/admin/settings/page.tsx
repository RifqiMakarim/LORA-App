import { createClient } from '@/lib/supabase/server';
import AdminSettingsClient from '@/components/dashboard/AdminSettingsClient';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const userProfile = {
    email: user.email || '',
    fullName: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || null,
  };

  return <AdminSettingsClient initialProfile={userProfile} />;
}
