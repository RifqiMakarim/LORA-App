import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductDetailView from '@/components/storefront/ProductDetailView';

interface PageProps {
    params: Promise<{
        slug: string;
        id: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url, businesses(name)')
        .eq('id', id)
        .maybeSingle();

    if (!product) {
        return {
            title: 'Produk Tidak Ditemukan - LORA Storefront',
        };
    }

    const business = Array.isArray(product.businesses) ? product.businesses[0] : product.businesses;
    const storeName = business?.name || 'UMKM LORA';

    return {
        title: `${product.name} - ${storeName} | LORA Storefront`,
        description: product.description || `Beli ${product.name} langsung dari toko ${storeName} di LORA Storefront.`,
        openGraph: {
            title: product.name,
            description: product.description || `Beli ${product.name} dari ${storeName}`,
            images: product.image_url ? [{ url: product.image_url }] : [],
        },
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id, slug } = await params;
    const supabase = await createClient();

    // Data Fetching product joined with business
    const { data: product, error } = await supabase
        .from('products')
        .select('*, businesses(*)')
        .eq('id', id)
        .maybeSingle();

    if (error || !product) {
        notFound();
    }

    const business = Array.isArray(product.businesses) ? product.businesses[0] : product.businesses;

    if (!business) {
        notFound();
    }

    return <ProductDetailView product={product} business={business} />;
}
