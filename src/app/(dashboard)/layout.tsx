import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Guard: Jika belum terautentikasi, redirect ke halaman login
    if (authError || !user) {
        redirect('/login');
    }

    // Ambil data profile dan data business milik user
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

    return (
        <DashboardShell user={user} profile={profile} business={business}>
            {children}
        </DashboardShell>
    );
}
