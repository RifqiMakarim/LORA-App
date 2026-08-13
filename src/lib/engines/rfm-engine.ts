export type RFMSegment = 
  | 'Champions'
  | 'Loyal Customers'
  | 'Potential Loyalists'
  | 'At Risk'
  | 'Hibernating';

export interface CustomerOrderData {
  customer_id: string;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  orders: {
    id: string;
    total_amount: number;
    created_at: string;
    order_status: string;
    payment_status: string;
  }[];
}

export interface CustomerRFMProfile {
  customer_id: string;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  recency_days: number;       // Jumlah hari sejak order terakhir
  frequency_count: number;    // Total order yang berhasil (paid/completed)
  monetary_total: number;     // Total pengeluaran dalam IDR
  score_r: number;            // Skor Recency (1-5)
  score_f: number;            // Skor Frequency (1-5)
  score_m: number;            // Skor Monetary (1-5)
  overall_rfm_score: number;  // R + F + M / 3
  segment: RFMSegment;
  last_order_date: string;
  recommended_action: string;
  suggested_wa_template: string;
}

export interface RFMAnalyticsSummary {
  total_customers: number;
  repeat_customer_rate: number; // Persentase pembeli > 1 transaksi (0-100)
  average_order_value: number;  // AOV dalam IDR
  estimated_clv: number;        // CLV dalam IDR
  segment_distribution: Record<RFMSegment, number>;
  customers: CustomerRFMProfile[];
}

/**
 * Menghitung skor kuantil (1-5) untuk sebuah array nilai numerik.
 */
function calculateQuintileScores(values: number[], isAscendingBetter = true): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [5];

  // Urutkan nilai untuk menentukan percentile
  const sortedWithIndex = values.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const n = values.length;
  const scores = new Array<number>(n);

  sortedWithIndex.forEach((item, rank) => {
    // Rank percentile dari 0 hingga 1
    const percentile = rank / (n - 1);
    
    // Tentukan skor 1 - 5 berdasarkan quintile percentile
    let score = 1;
    if (percentile >= 0.8) score = 5;
    else if (percentile >= 0.6) score = 4;
    else if (percentile >= 0.4) score = 3;
    else if (percentile >= 0.2) score = 2;
    else score = 1;

    // Jika nilai lebih kecil lebih baik (misal Recency: hari yang lebih sedikit = lebih baru = lebih baik)
    if (!isAscendingBetter) {
      score = 6 - score;
    }

    scores[item.idx] = score;
  });

  return scores;
}

/**
 * Menentukan nama segmen RFM berdasarkan kombinasi skor R, F, dan M.
 */
export function determineRFMSegment(r: number, f: number, m: number): RFMSegment {
  if (r >= 4 && f >= 4 && m >= 4) {
    return 'Champions';
  }
  if (r >= 3 && f >= 3) {
    return 'Loyal Customers';
  }
  if (r >= 3 && f <= 2) {
    return 'Potential Loyalists';
  }
  if (r <= 2 && (f >= 3 || m >= 3)) {
    return 'At Risk';
  }
  return 'Hibernating';
}

/**
 * Memberikan rekomendasi strategi & template pesan WhatsApp terpersonalisasi untuk tiap segmen.
 */
export function getSegmentActionDetails(segment: RFMSegment, customerName: string): {
  action: string;
  waTemplate: string;
} {
  switch (segment) {
    case 'Champions':
      return {
        action: 'Berikan perlakuan VIP, akses lebih awal untuk produk edisi terbatas, & poin reward ganda.',
        waTemplate: `Halo Kak ${customerName}! Terima kasih telah menjadi pelanggan setia kami. Spesial untuk Anda, nikmati promo eksklusif VIP Diskon 20% untuk koleksi terbaru minggu ini!`
      };
    case 'Loyal Customers':
      return {
        action: 'Tawarkan produk komplementer (cross-selling) dan voucher diskon khusus pembelian berikutnya.',
        waTemplate: `Sugeng tinemu Kak ${customerName}! Terima kasih sudah berlangganan. Kami ada voucher hemat Rp 25.000 untuk pesanan berikutnya khusus hari ini!`
      };
    case 'Potential Loyalists':
      return {
        action: 'Berikan penawaran diskon pembelian kedua untuk mendorong menjadi pelanggan rutin.',
        waTemplate: `Halo Kak ${customerName}! Suka dengan produk kami sebelumnya? Yuk cek produk terlaris kami lainnya dan dapatkan diskon 10% untuk transaksi kedua!`
      };
    case 'At Risk':
      return {
        action: 'Kirimkan pesan penawaran win-back spesial sebelum pelanggan menjadi inaktif.',
        waTemplate: `Kangen belanja lagi di toko kami Kak ${customerName}? Kami rindu melayani Anda! Gunakan kode voucher KANGEN15 untuk cashback 15%!`
      };
    case 'Hibernating':
    default:
      return {
        action: 'Sajikan penawaran re-engagement dengan diskon produk paling laris.',
        waTemplate: `Halo Kak ${customerName}, ada kabar gembira! Ada produk baru favorit lokal yang siap menyapa Anda. Cek toko kami sekarang yuk!`
      };
  }
}

/**
 * Engine utama perhitungan RFM Segmentation & Customer Analytics.
 */
export function calculateRFMSegmentation(
  rawData: CustomerOrderData[],
  referenceDate: Date = new Date()
): RFMAnalyticsSummary {
  const filteredCustomers = rawData.filter(c => c.customer_id && c.orders && c.orders.length > 0);

  if (filteredCustomers.length === 0) {
    return {
      total_customers: 0,
      repeat_customer_rate: 0,
      average_order_value: 0,
      estimated_clv: 0,
      segment_distribution: {
        'Champions': 0,
        'Loyal Customers': 0,
        'Potential Loyalists': 0,
        'At Risk': 0,
        'Hibernating': 0,
      },
      customers: [],
    };
  }

  // 1. Ekstrak nilai mentah R, F, M per pelanggan
  const parsedMetrics = filteredCustomers.map(c => {
    // Filter transaksi yang sukses (paid / completed)
    const validOrders = c.orders.filter(o => 
      o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing'
    );
    const orderCount = validOrders.length > 0 ? validOrders.length : c.orders.length;

    // Hitung tanggal order paling terakhir
    const dates = c.orders.map(o => new Date(o.created_at).getTime());
    const latestOrderTimestamp = Math.max(...dates);
    const latestOrderDate = new Date(latestOrderTimestamp);

    // Hitung selisih hari dari referenceDate (Recency)
    const diffTime = Math.abs(referenceDate.getTime() - latestOrderDate.getTime());
    const recencyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Total spending (Monetary)
    const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      customer: c,
      recencyDays,
      frequencyCount: orderCount,
      monetaryTotal: totalSpent,
      latestOrderDateStr: latestOrderDate.toISOString(),
    };
  });

  // 2. Hitung Skor Quintile (1 - 5)
  const recencies = parsedMetrics.map(m => m.recencyDays);
  const frequencies = parsedMetrics.map(m => m.frequencyCount);
  const monetaries = parsedMetrics.map(m => m.monetaryTotal);

  // Recency: hari lebih kecil = lebih baik => isAscendingBetter = false
  const rScores = calculateQuintileScores(recencies, false);
  const fScores = calculateQuintileScores(frequencies, true);
  const mScores = calculateQuintileScores(monetaries, true);

  // 3. Gabungkan hasil ke CustomerRFMProfile
  const segmentCounts: Record<RFMSegment, number> = {
    'Champions': 0,
    'Loyal Customers': 0,
    'Potential Loyalists': 0,
    'At Risk': 0,
    'Hibernating': 0,
  };

  let totalRevenue = 0;
  let totalOrderCountAll = 0;
  let repeatCustomerCount = 0;

  const customers: CustomerRFMProfile[] = parsedMetrics.map((item, idx) => {
    const r = rScores[idx];
    const f = fScores[idx];
    const m = mScores[idx];
    const segment = determineRFMSegment(r, f, m);

    segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
    totalRevenue += item.monetaryTotal;
    totalOrderCountAll += item.frequencyCount;

    if (item.frequencyCount > 1) {
      repeatCustomerCount++;
    }

    const { action, waTemplate } = getSegmentActionDetails(segment, item.customer.full_name);

    return {
      customer_id: item.customer.customer_id,
      full_name: item.customer.full_name,
      phone_number: item.customer.phone_number,
      avatar_url: item.customer.avatar_url,
      recency_days: item.recencyDays,
      frequency_count: item.frequencyCount,
      monetary_total: item.monetaryTotal,
      score_r: r,
      score_f: f,
      score_m: m,
      overall_rfm_score: Number(((r + f + m) / 3).toFixed(2)),
      segment,
      last_order_date: item.latestOrderDateStr,
      recommended_action: action,
      suggested_wa_template: waTemplate,
    };
  });

  const totalCustomers = customers.length;
  const repeatRate = Number(((repeatCustomerCount / totalCustomers) * 100).toFixed(1));
  const avgOrderValue = totalOrderCountAll > 0 ? Math.round(totalRevenue / totalOrderCountAll) : 0;
  const avgCustomerSpend = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  // Perkiraan Customer Lifetime Value sederhaha (Average Spend x Repeat Factor)
  const estimatedClv = Math.round(avgCustomerSpend * (1 + (repeatRate / 100)));

  return {
    total_customers: totalCustomers,
    repeat_customer_rate: repeatRate,
    average_order_value: avgOrderValue,
    estimated_clv: estimatedClv,
    segment_distribution: segmentCounts,
    customers,
  };
}
