/**
 * QRIS Dynamic Payload & SVG Generator Engine (EMVCo Standard)
 * LORA (Local Omni-channel Regional Assistant)
 */

export interface QRISGeneratorInput {
    storeName: string;
    storeCity?: string;
    amount: number;
    orderId?: string;
    nmin?: string; // National Merchant Identification Number
}

/**
 * Constructs an EMVCo-compliant QRIS Dynamic String Payload.
 */
export function generateQRISPayload(input: QRISGeneratorInput): string {
    const storeName = (input.storeName || 'UMKM LORA').slice(0, 25).toUpperCase();
    const city = (input.storeCity || 'YOGYAKARTA').slice(0, 15).toUpperCase();
    const formattedAmount = Math.max(1, Math.floor(input.amount)).toString();
    const nmin = input.nmin || 'ID1020034567890';

    // EMVCo QRIS Field Definitions:
    // 00: Payload Format Indicator ("01")
    // 01: Point of Initiation Method ("12" - Dynamic QR)
    // 26: Merchant Account Information (ID.QRIS.WWW)
    // 52: Merchant Category Code ("5999" - Miscellaneous General Merchandise)
    // 53: Transaction Currency ("360" - IDR)
    // 54: Transaction Amount
    // 58: Country Code ("ID")
    // 59: Merchant Name
    // 60: Merchant City
    // 63: CRC16 (Calculated at end)

    const payloadWithoutCrc =
        `000201` +
        `010212` +
        `26580015ID.QRIS.WWW` + `0118${nmin}` + `0215ID1020034567890` +
        `52045999` +
        `5303360` +
        `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}` +
        `5802ID` +
        `59${storeName.length.toString().padStart(2, '0')}${storeName}` +
        `60${city.length.toString().padStart(2, '0')}${city}` +
        `6304`;

    // Calculate CRC16-CCITT checksum for string
    const crc = calculateCRC16(payloadWithoutCrc);
    return payloadWithoutCrc + crc;
}

/**
 * CRC16-CCITT (0x1021, seed 0xFFFF) checksum calculation algorithm for QRIS EMVCo
 */
function calculateCRC16(str: string): string {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xffff;
            } else {
                crc = (crc << 1) & 0xffff;
            }
        }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Render standard QRIS Display Info helper
 */
export function generateQRISDisplayInfo(input: QRISGeneratorInput) {
    const payload = generateQRISPayload(input);
    return {
        payload,
        formattedAmount: `Rp ${input.amount.toLocaleString('id-ID')}`,
        merchantName: input.storeName,
        merchantCity: input.storeCity || 'DI YOGYAKARTA',
        nmin: input.nmin || 'ID1020034567890',
        issuerLogo: 'QRIS Standar Pembayaran Nasional Indonesia',
    };
}
