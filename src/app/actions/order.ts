'use server';

import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/fonnte';

export interface CreateOrderInput {
    storeSlug?: string;
    business_id?: string;
    totalAmount: number;
    paymentMethod?: string;
    buyerName?: string;
    buyerPhone?: string;
    items?: Array<{
        product_id: string;
        quantity: number;
        price_per_item: number;
    }>;
}

export type CreateOrderResult = {
    success?: boolean;
    error?: string;
    order?: any;
};

/**
 * Format nomor HP/WhatsApp agar selalu diawali dengan '62' (tanpa '0' atau '+')
 */
function formatPhone62(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62') && cleaned.length > 0) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

/**
 * Server Action untuk Pembuatan Pesanan (Submit Order / Checkout)
 * 1. Mendapatkan user id dari Supabase Auth
 * 2. Mengambil data nama dan nomor telepon pembeli dari tabel profiles
 * 3. Menentukan status awal (pending)
 * 4. Melakukan INSERT ke tabel orders dan memanggil .select().single()
 * 5. Mengirimkan notifikasi WhatsApp Fonnte ke penjual dengan templat pesan yang sesuai
 * 6. Memasukkan rincian item pesanan ke tabel order_items
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    try {
        const supabase = await createClient();

        // 1. Ambil customer_id dari Supabase Auth & profil pembeli
        const { data: { user } } = await supabase.auth.getUser();
        const customerId = user?.id || null;

        let buyerName = input.buyerName || 'Pembeli LORA';
        let buyerPhoneRaw = input.buyerPhone || '';

        if (customerId) {
            const { data: buyerProfile } = await supabase
                .from('profiles')
                .select('full_name, phone_number')
                .eq('id', customerId)
                .maybeSingle();

            if (buyerProfile) {
                if (buyerProfile.full_name) buyerName = buyerProfile.full_name;
                if (buyerProfile.phone_number) {
                    buyerPhoneRaw = buyerProfile.phone_number;
                } else if (input.buyerPhone) {
                    buyerPhoneRaw = input.buyerPhone;
                    await supabase
                        .from('profiles')
                        .update({ phone_number: input.buyerPhone.trim() })
                        .eq('id', customerId);
                }
            } else if (user) {
                // Safeguard Defensif: Buat profil otomatis jika belum ada sebelum insert ke orders
                const fallbackName = input.buyerName || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pembeli LORA';
                const initialPhone = input.buyerPhone ? input.buyerPhone.trim() : null;
                buyerName = fallbackName;
                if (initialPhone) buyerPhoneRaw = initialPhone;

                await supabase.from('profiles').insert([{
                    id: customerId,
                    full_name: fallbackName,
                    phone_number: initialPhone,
                    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                    is_buyer: true,
                    is_seller: false,
                    is_admin: false,
                }]);
            }
        }

        const buyerPhoneFormatted = formatPhone62(buyerPhoneRaw);

        // 2. Tentukan business_id
        let businessId = input.business_id || null;

        if (!businessId && input.storeSlug) {
            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('slug', input.storeSlug)
                .maybeSingle();

            if (business) {
                businessId = business.id;
            }
        }

        if (!businessId) {
            return { error: 'Toko bisnis tidak ditemukan untuk membuat pesanan.' };
        }

        // 3. Buat token unik (wa_token) dan short_id acak 4-5 angka (ORD-XXXX)
        const generatedToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
        const shortId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

        const selectedMethod = input.paymentMethod || 'qris';

        // 4. Susun payload data untuk insert ke tabel orders (order_status default: 'pending')
        const orderPayload = {
            customer_id: customerId,
            business_id: businessId,
            total_amount: input.totalAmount,
            payment_method: selectedMethod,
            order_status: 'pending',
            wa_token: generatedToken,
            short_id: shortId,
        };

        // 5. Melakukan INSERT ke tabel orders dan gunakan select().single() setelah insert
        const { data: orderData, error: insertError } = await supabase
            .from('orders')
            .insert([orderPayload])
            .select()
            .single();

        if (insertError) {
            console.error('Gagal menyimpan data pesanan ke Supabase (INSERT orders):', insertError);
            return { error: `Gagal membuat pesanan: ${insertError.message}` };
        }

        // 6. Notifikasi WA Penjual & Console.log simulasi Link WA
        if (orderData?.id && orderData?.wa_token) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const actionUrl = `${appUrl}/dashboard/pesanan?highlight=${orderData.id}`;

            console.log('Simulasi Link WA: ' + actionUrl);

            // Fetch data toko untuk mengambil nomor whatsapp/kontak penjual
            const { data: store } = await supabase
                .from('businesses')
                .select('contact_number, owner_id')
                .eq('id', businessId)
                .maybeSingle();

            let sellerPhone = store?.contact_number;
            if (!sellerPhone && store?.owner_id) {
                const { data: ownerProfile } = await supabase
                    .from('profiles')
                    .select('phone_number')
                    .eq('id', store.owner_id)
                    .maybeSingle();
                sellerPhone = ownerProfile?.phone_number;
            }

            if (sellerPhone) {
                const displayShortId = orderData.short_id || shortId;
                const buyerWaLink = buyerPhoneFormatted ? `https://wa.me/${buyerPhoneFormatted}` : '-';

                let pesanWA = '';

                if (orderData.payment_method === 'cash') {
                    pesanWA = `🔔 *PESANAN BARU (CASH) - LORA* 🔔

Halo Admin Toko, ada pesanan tunai baru, pembeli akan bayar di kasir.
*ID:* ${displayShortId}
*Pembeli:* ${buyerName}
*Metode:* CASH
*Total:* Rp ${orderData.total_amount}

*Hubungi Pembeli:* ${buyerWaLink}

👇 *TINDAKAN DIBUTUHKAN* 👇
Klik tautan di bawah ini untuk melihat detail dan memproses pesanan:

${actionUrl}`;
                } else {
                    pesanWA = `🔔 *KONFIRMASI PEMBAYARAN - LORA* 🔔

Halo Admin Toko, pembeli telah membuat pesanan dan mengonfirmasi pembayaran. Silakan cek mutasi Anda, lalu klik tautan berikut untuk memproses pesanan:
*ID:* ${displayShortId}
*Pembeli:* ${buyerName}
*Metode:* ${String(orderData.payment_method || 'qris').toUpperCase()}
*Total:* Rp ${orderData.total_amount}

*Hubungi Pembeli:* ${buyerWaLink}

👇 *TINDAKAN DIBUTUHKAN* 👇
Klik tautan di bawah ini untuk melihat detail dan memproses pesanan:

${actionUrl}`;
                }

                try {
                    await sendWhatsAppMessage(sellerPhone, pesanWA);
                } catch (waErr) {
                    console.error('Gagal mengirimkan pesan WhatsApp Fonnte:', waErr);
                }
            }
        }

        // 7. Simpan rincian item ke tabel order_items jika tersedia
        if (input.items && input.items.length > 0 && orderData?.id) {
            const orderItemsPayload = input.items.map((item) => ({
                order_id: orderData.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_per_item: item.price_per_item,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsPayload);

            if (itemsError) {
                console.error('Gagal menyimpan rincian item pesanan (INSERT order_items):', itemsError);
            }
        }

        return { success: true, order: orderData };
    } catch (err: any) {
        console.error('Terjadi kesalahan tidak terduga pada createOrder:', err);
        return { error: err.message || 'Terjadi kesalahan sistem saat membuat pesanan.' };
    }
}

/**
 * Server Action untuk Pembatalan Pesanan Pembeli
 * Memperbarui order_status menjadi 'cancelled' di tabel orders Supabase
 */
export async function cancelOrder(orderId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // 1. Verifikasi Sesi User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'Anda harus login terlebih dahulu untuk membatalkan pesanan.' };
        }

        console.log(`[cancelOrder Execution] Initiating order cancel for ID: ${orderId} by User: ${user.id}`);

        // 2. Eksekusi UPDATE langsung ke tabel orders
        const { data: updatedRows, error: updateError } = await supabase
            .from('orders')
            .update({
                order_status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .select();

        if (updateError) {
            console.error('[cancelOrder DB Error]:', updateError);
            return { error: `Gagal membatalkan pesanan di database: ${updateError.message}` };
        }

        if (!updatedRows || updatedRows.length === 0) {
            console.warn('[cancelOrder Warning] 0 rows updated for order ID:', orderId);
            return { error: 'Pesanan tidak ditemukan atau status tidak dapat diubah.' };
        }

        console.log('[cancelOrder SUCCESS] Order successfully cancelled:', updatedRows[0]);
        return { success: true };
    } catch (err: any) {
        console.error('[cancelOrder Exception]:', err);
        return { error: err.message || 'Terjadi kesalahan sistem saat membatalkan pesanan.' };
    }
}

/**
 * Server Action untuk Penjual Menolak Pesanan
 * Memperbarui order_status menjadi 'cancelled' di tabel orders Supabase
 */
export async function rejectOrder(orderId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // 1. Verifikasi Sesi User Penjual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'Anda harus login terlebih dahulu untuk menolak pesanan.' };
        }

        console.log(`[rejectOrder Execution] Rejecting order ID: ${orderId} by Seller: ${user.id}`);

        // 2. Eksekusi UPDATE langsung ke tabel orders
        const { data: updatedRows, error: updateError } = await supabase
            .from('orders')
            .update({
                order_status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .select();

        if (updateError) {
            console.error('[rejectOrder DB Error]:', updateError);
            return { error: `Gagal menolak pesanan di database: ${updateError.message}` };
        }

        if (!updatedRows || updatedRows.length === 0) {
            console.warn('[rejectOrder Warning] 0 rows updated for order ID:', orderId);
            return { error: 'Pesanan tidak ditemukan atau status tidak dapat diubah.' };
        }

        console.log('[rejectOrder SUCCESS] Order successfully rejected:', updatedRows[0]);
        return { success: true };
    } catch (err: any) {
        console.error('[rejectOrder Exception]:', err);
        return { error: err.message || 'Terjadi kesalahan sistem saat menolak pesanan.' };
    }
}
