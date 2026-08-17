/**
 * Utilitas untuk mengirim pesan WhatsApp menggunakan API Fonnte (api.fonnte.com)
 * @param targetNumber Nomor telepon/WhatsApp tujuan (contoh: '081234567890')
 * @param message Isi pesan WhatsApp yang akan dikirim
 */
export async function sendWhatsAppMessage(targetNumber: string, message: string) {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
        console.warn('[Fonnte WA] Warning: FONNTE_TOKEN tidak ditemukan di environment variables.');
    }

    try {
        const formData = new FormData();
        formData.append('target', targetNumber);
        formData.append('message', message);

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                Authorization: token || '',
            },
            body: formData,
        });

        const data = await response.json();
        console.log('[Fonnte WA] Respons pengiriman WhatsApp:', data);
        return { success: response.ok, data };
    } catch (error: any) {
        console.error('[Fonnte WA] Gagal mengirim pesan WhatsApp via Fonnte:', error);
        return { success: false, error: error.message };
    }
}
