import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getBusinessBySlug } from '@/app/actions/business';
import TokoStorefrontView from '@/components/storefront/TokoStorefrontView';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Metadata SEO dinamis untuk halaman etalase UMKM
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const business = await getBusinessBySlug(slug);

    if (!business) {
        return {
            title: 'Toko Tidak Ditemukan - LORA Storefront',
        };
    }

    return {
        title: `${business.name} - Etalase Publik UMKM LORA`,
        description: business.description || `Jelajahi & beli produk unggulan dari ${business.name} di LORA Regional Storefront.`,
        openGraph: {
            title: business.name,
            description: business.description || `Jelajahi & beli produk unggulan dari ${business.name}`,
            images: business.logo_url ? [{ url: business.logo_url }] : [],
        },
    };
}

/**
 * Server Component Halaman Etalase Publik Toko UMKM (/toko/[slug])
 */
export default async function TokoStorefrontPage({ params }: PageProps) {
    const { slug } = await params;

    // 1. Data Fetching Profil Bisnis dengan Upstash Redis Caching (Cache-Aside pattern: `store:profile:${slug}`)
    const business = await getBusinessBySlug(slug);

    // Jika toko tidak ditemukan, alihkan ke 404
    if (!business) {
        notFound();
    }

    const supabase = await createClient();

    // 2. Data Fetching Katalog Produk milik toko tersebut
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return <TokoStorefrontView business={business} products={products || []} />;
}

