import { createClient } from '@/lib/supabase/server';
import StorefrontNavbar from '@/components/storefront/StorefrontNavbar';
import { CartProvider } from '@/components/storefront/CartContext';
import { Toaster } from 'react-hot-toast';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        profile = data;
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

                {/* Footer Storefront Minimalis */}
                <footer suppressHydrationWarning className="bg-white border-t border-slate-200 mt-12 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
                    <div suppressHydrationWarning className="flex items-center justify-center gap-2 font-bold text-slate-800 text-sm">
                        <span>🏪 LORA Storefront</span>
                        <span>•</span>
                        <span>Platform Produk UMKM DIY & Jawa Tengah</span>
                    </div>
                    <p>© 2026 LORA Regional Assistant. Seluruh hak cipta dilindungi.</p>
                </footer>
            </div>
        </CartProvider>
    );
}
