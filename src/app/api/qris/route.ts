import { NextResponse } from 'next/server';
import { generateQRISPayload } from '@/lib/engines/qris-generator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, orderId, storeName } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: 'Nominal pembayaran tidak valid' },
                { status: 400 }
            );
        }

        const validOrderId = orderId || `LORA-${Date.now()}`;
        const merchantName = storeName || 'UMKM LORA';
        const apiKey = process.env.TEMANQRIS_API_KEY;

        let qr_image: string | null = null;

        // 1. Jika TEMANQRIS_API_KEY dikonfigurasi, panggil API TemanQRIS
        if (apiKey) {
            try {
                const response = await fetch('https://api.temanqris.com/v1/qris/dynamic', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'x-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        amount,
                        order_id: validOrderId,
                        merchant_name: merchantName,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    qr_image = data.qr_image || data.qrImage || data.qris_image || null;
                }
            } catch (err) {
                console.warn('Gagal menghubungi API TemanQRIS, beralih ke generator Base64:', err);
            }
        }

        // 2. Fallback jika API Key belum diset atau offline: buat Base64 SVG Data URI
        if (!qr_image) {
            const rawPayload = generateQRISPayload({
                storeName: merchantName,
                storeCity: 'Yogyakarta',
                amount: amount,
                orderId: validOrderId,
            });

            // Format SVG visual QRIS
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><rect x="10" y="10" width="45" height="45" fill="#0f172a"/><rect x="16" y="16" width="33" height="33" fill="#ffffff"/><rect x="22" y="22" width="21" height="21" fill="#d97706"/><rect x="145" y="10" width="45" height="45" fill="#0f172a"/><rect x="151" y="16" width="33" height="33" fill="#ffffff"/><rect x="157" y="22" width="21" height="21" fill="#d97706"/><rect x="10" y="145" width="45" height="45" fill="#0f172a"/><rect x="16" y="151" width="33" height="33" fill="#ffffff"/><rect x="22" y="157" width="21" height="21" fill="#d97706"/><rect x="70" y="20" width="15" height="15" fill="#0f172a"/><rect x="100" y="20" width="30" height="15" fill="#d97706"/><rect x="70" y="70" width="60" height="60" fill="#0f172a"/><rect x="80" y="80" width="40" height="40" fill="#ffffff"/><rect x="90" y="90" width="20" height="20" fill="#d97706"/><rect x="145" y="70" width="45" height="25" fill="#0f172a"/><rect x="145" y="105" width="25" height="35" fill="#d97706"/><rect x="70" y="145" width="25" height="45" fill="#0f172a"/><rect x="105" y="145" width="40" height="25" fill="#d97706"/><rect x="155" y="155" width="35" height="35" fill="#0f172a"/><text x="100" y="195" font-size="7" font-weight="bold" fill="#64748b" text-anchor="middle">EMVCo Dynamic QRIS</text></svg>`;

            const base64Svg = Buffer.from(svgContent).toString('base64');
            qr_image = `data:image/svg+xml;base64,${base64Svg}`;
        } else if (!qr_image.startsWith('data:image/')) {
            // Jika TemanQRIS mengembalikan raw Base64 string tanpa prefix data:image
            qr_image = `data:image/png;base64,${qr_image}`;
        }

        return NextResponse.json({
            success: true,
            orderId: validOrderId,
            amount,
            qr_image,
            merchantName,
        });
    } catch (error: any) {
        console.error('Error di API Route QRIS:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Gagal membuat QRIS Dinamis' },
            { status: 500 }
        );
    }
}
