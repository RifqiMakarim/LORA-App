import { createClient } from '@/lib/supabase/server';
import StorefrontNavbar from '@/components/storefront/StorefrontNavbar';
import { CartProvider } from '@/components/storefront/CartContext';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const { data: businessData } = await supabase
            .from('businesses')
            .select('id, name, slug')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (profileData) {
            profile = { ...profileData };
            // Jika user memiliki toko terdaftar tapi is_seller masih false/null, perbaiki statusnya
            if (businessData && !profile.is_seller) {
                profile.is_seller = true;
                // Auto-healing sync ke database Supabase di background
                supabase
                    .from('profiles')
                    .update({ is_seller: true, updated_at: new Date().toISOString() })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('[StorefrontLayout] Auto-sync profile is_seller error:', error);
                    });
            }
        }
    }

    return (
        <CartProvider initialUser={user}>
            <div suppressHydrationWarning>
                <Toaster position="top-right" reverseOrder={false} />
            </div>
            <div suppressHydrationWarning className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-terracotta selection:text-white">
                <StorefrontNavbar user={user} profile={profile} />
                <main suppressHydrationWarning className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>

                {/* Footer Storefront LORA (Latar Gelap bg-[#0B1120]) */}
                <footer suppressHydrationWarning className="bg-[#0B1120] text-slate-400 border-t border-slate-800/80 mt-12 py-8 px-4 text-center text-xs space-y-2.5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div suppressHydrationWarning className="relative z-10 flex items-center justify-center gap-2 font-bold text-white text-sm">
                        <div className="w-6.5 h-6.5 rounded-full bg-white p-0.5 shadow-md border border-slate-700 inline-flex items-center justify-center overflow-hidden align-middle flex-shrink-0">
                            <Image
                                src="/images/loralogo.jpeg"
                                alt="Logo LORA"
                                width={26}
                                height={26}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <span className="font-outfit font-extrabold tracking-tight text-white">LORA Storefront</span>
                        <span className="text-amber-400">•</span>
                        <span className="text-slate-300 text-xs sm:text-sm font-medium">Platform Produk UMKM DIY & Jawa Tengah</span>
                    </div>

                    <p className="relative z-10 text-slate-400 text-xs font-medium">
                        © 2026 LORA Regional Assistant. Seluruh hak cipta dilindungi.
                    </p>
                </footer>
            </div>
        </CartProvider>
    );
}
