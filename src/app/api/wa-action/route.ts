import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function renderHtmlResponse({
    success,
    title,
    message,
    statusText,
}: {
    success: boolean;
    title: string;
    message: string;
    statusText?: string;
}) {
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - LORA WhatsApp Action</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 text-center space-y-6">
        ${
            success
                ? `
            <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div class="space-y-2">
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">Aksi Berhasil!</h1>
                <p class="text-sm text-slate-600 leading-relaxed font-medium">
                    Status pesanan telah diperbarui. Silakan tutup halaman ini dan kembali ke WhatsApp.
                </p>
            </div>
            ${
                statusText
                    ? `<div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold">
                        <span>Status Baru:</span> <span class="uppercase tracking-wider">${statusText}</span>
                    </div>`
                    : ''
            }
        `
                : `
            <div class="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-rose-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <div class="space-y-2">
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">${title}</h1>
                <p class="text-sm text-slate-600 leading-relaxed font-medium">${message}</p>
            </div>
        `
        }
        
        <div class="pt-4 border-t border-slate-100">
            <p class="text-xs text-slate-400 font-semibold">LORA Regional Assistant &copy; 2026</p>
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        status: success ? 200 : 400,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const action = searchParams.get('action');
        const token = searchParams.get('token');

        // Validasi Awal: Pastikan ketiga parameter ada
        if (!id || !action || !token) {
            return renderHtmlResponse({
                success: false,
                title: 'Tautan Tidak Valid',
                message: 'Tautan tidak valid atau sudah kedaluwarsa.',
            });
        }

        const supabase = await createClient();

        // Periksa ke tabel orders: SELECT id FROM orders WHERE id = id AND wa_token = token
        const { data: order, error: findError } = await supabase
            .from('orders')
            .select('id')
            .eq('id', id)
            .eq('wa_token', token)
            .maybeSingle();

        if (findError || !order) {
            return renderHtmlResponse({
                success: false,
                title: 'Tautan Tidak Valid',
                message: 'Tautan tidak valid atau sudah kedaluwarsa.',
            });
        }

        // Logika Update berdasarkan action
        let updatePayload: Record<string, any> = {};
        let statusDisplay = '';

        switch (action) {
            case 'process':
                updatePayload = {
                    payment_status: 'paid',
                    order_status: 'processing',
                    updated_at: new Date().toISOString(),
                };
                statusDisplay = 'Pesanan Diproses';
                break;

            case 'ready':
                updatePayload = {
                    order_status: 'ready_for_pickup',
                    updated_at: new Date().toISOString(),
                };
                statusDisplay = 'Siap Diambil';
                break;

            case 'complete':
            case 'cash_complete':
                updatePayload = {
                    payment_status: 'paid',
                    order_status: 'completed',
                    updated_at: new Date().toISOString(),
                };
                statusDisplay = 'Selesai';
                break;

            default:
                return renderHtmlResponse({
                    success: false,
                    title: 'Aksi Tidak Dikenal',
                    message: 'Tautan tidak valid atau sudah kedaluwarsa.',
                });
        }

        // Lakukan UPDATE ke tabel orders
        const { error: updateError } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', id);

        if (updateError) {
            console.error('Error updating order via wa-action:', updateError);
            return renderHtmlResponse({
                success: false,
                title: 'Gagal Memperbarui Pesanan',
                message: 'Terjadi kesalahan saat memperbarui status pesanan.',
            });
        }

        // Kembalikan Response HTML sukses
        return renderHtmlResponse({
            success: true,
            title: 'Aksi Berhasil',
            message: 'Status pesanan telah diperbarui. Silakan tutup halaman ini dan kembali ke WhatsApp',
            statusText: statusDisplay,
        });
    } catch (err: any) {
        console.error('Unexpected error in wa-action route:', err);
        return renderHtmlResponse({
            success: false,
            title: 'Terjadi Kesalahan',
            message: 'Tautan tidak valid atau sudah kedaluwarsa.',
        });
    }
}
