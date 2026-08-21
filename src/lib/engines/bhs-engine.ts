export interface BHSMetricBreakdown {
  revenue_score: number;
  margin_score: number;
  inventory_turn_score: number;
  retention_score: number;
  safety_stock_score: number;
  event_adaptability_score: number;
  overall_score: number;
}

export interface BHSInputData {
  orders: {
    id: string;
    total_amount: number;
    created_at: string;
    customer_id: string | null;
    payment_status: string;
    order_status: string;
  }[];
  products: {
    id: string;
    stock: number;
    min_stock: number;
    price: number;
  }[];
  localEvents: {
    id: string;
    title: string;
    province_name: string;
    start_date: string;
    end_date: string;
    expected_tourist_impact: 'low' | 'medium' | 'high' | 'massive';
  }[];
  businessProvince?: string | null;
  soldQuantity30Days: number; // Jumlah total item produk terjual 30 hari terakhir
}

/**
 * Engine utama perhitungan Business Health Score (BHS) LORA (Skala 0-100)
 */
export function calculateBusinessHealthScore(data: BHSInputData): BHSMetricBreakdown {
  const { orders, products, localEvents, businessProvince, soldQuantity30Days } = data;

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);

  // Filter order 30 hari terakhir (Sukses: paid / completed / processing)
  const orders30d = orders.filter(o => {
    const oDate = new Date(o.created_at);
    const isRecent = oDate >= thirtyDaysAgo;
    const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
    return isRecent && isSuccessful;
  });

  // Filter order 90 hari terakhir untuk retention
  const orders90d = orders.filter(o => {
    const oDate = new Date(o.created_at);
    const isRecent = oDate >= ninetyDaysAgo;
    const isSuccessful = o.payment_status === 'paid' || o.order_status === 'completed' || o.order_status === 'processing';
    return isRecent && isSuccessful;
  });

  // 1. REVENUE SCORE (Omzet)
  // Benchmark bulanan UMKM regional target: 15.000.000 IDR
  const BENCHMARK_REVENUE = 15000000;
  const totalRevenue30d = orders30d.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  let revenueScore = 50; // Baseline jika toko baru/belum ada penjualan
  if (orders.length > 0) {
    revenueScore = Math.min((totalRevenue30d / BENCHMARK_REVENUE) * 100, 100);
    // Berikan bobot minimum 20 jika sudah ada penjualan agar tidak terlalu drop
    if (totalRevenue30d > 0) {
      revenueScore = Math.max(revenueScore, 20);
    }
  }
  revenueScore = Math.round(revenueScore);

  // 2. PROFIT MARGIN SCORE
  // Diestimasi dari Average Order Value (AOV)
  const aov30d = orders30d.length > 0 ? totalRevenue30d / orders30d.length : 0;
  let marginScore = 75; // Default score
  if (aov30d > 0) {
    if (aov30d >= 250000) marginScore = 95;
    else if (aov30d >= 150000) marginScore = 85;
    else if (aov30d >= 80000) marginScore = 75;
    else marginScore = 60;
  }
  marginScore = Math.round(marginScore);

  // 3. INVENTORY TURN SCORE (Turn Rate Stok)
  // Formula: soldQty / (soldQty + currentStock)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  let inventoryTurnScore = 50; // Default
  
  if (soldQuantity30Days > 0 || totalStock > 0) {
    const turnRate = soldQuantity30Days / Math.max(soldQuantity30Days + totalStock, 1);
    // Dianggap turn rate bulanan ideal adalah 25% (stok berputar 3-4 kali setahun)
    // Kalikan turnRate dengan 400 untuk normalisasi ke 100
    inventoryTurnScore = Math.min(turnRate * 400, 100);
    // Minimum score jika ada perputaran
    if (soldQuantity30Days > 0) {
      inventoryTurnScore = Math.max(inventoryTurnScore, 30);
    }
  }
  inventoryTurnScore = Math.round(inventoryTurnScore);

  // 4. RETENTION SCORE (Loyalitas Pelanggan)
  // Menghitung persentase repeat customer dalam 90 hari terakhir
  const customerOrdersMap = new Map<string, number>();
  let guestOrderCount = 0;

  orders90d.forEach(o => {
    if (o.customer_id) {
      customerOrdersMap.set(o.customer_id, (customerOrdersMap.get(o.customer_id) || 0) + 1);
    } else {
      guestOrderCount++;
    }
  });

  const uniqueUsers = customerOrdersMap.size;
  let repeatUsers = 0;
  customerOrdersMap.forEach(count => {
    if (count >= 2) repeatUsers++;
  });

  let retentionScore = 50; // Default
  if (uniqueUsers > 0) {
    const repeatRate = (repeatUsers / uniqueUsers) * 100;
    // Skala industri retail repeat customer rate 20% sudah sangat baik
    retentionScore = Math.min((repeatRate / 20) * 100, 100);
    retentionScore = Math.max(retentionScore, 30);
  } else if (guestOrderCount > 0) {
    // Jika semua order adalah Guest (belum tercatat ID user), beri score moderat
    retentionScore = 60;
  }
  retentionScore = Math.round(retentionScore);

  // 5. SAFETY STOCK SCORE (Keamanan Inventoris)
  // Dimulai dari 100, dikurangi jika ada produk yang habis atau di bawah batas minimum (ROP)
  let safetyScore = 100;
  if (products.length > 0) {
    let outOfStockCount = 0;
    let belowMinStockCount = 0;
    let overstockCount = 0;

    products.forEach(p => {
      if (p.stock <= 0) {
        outOfStockCount++;
      } else if (p.stock <= p.min_stock) {
        belowMinStockCount++;
      } else if (p.stock > p.min_stock * 2.5) {
        overstockCount++;
      }
    });

    const totalProducts = products.length;
    // Penalti pengurangan
    const penalty = (outOfStockCount / totalProducts) * 50 + (belowMinStockCount / totalProducts) * 20 + (overstockCount / totalProducts) * 10;
    safetyScore = Math.max(100 - penalty, 10);
  }
  safetyScore = Math.round(safetyScore);

  // 6. EVENT ADAPTABILITY SCORE (Kemampuan Beradaptasi Event Regional)
  // Mengukur kesiapan toko menghadapi event lokal terdekat di provinsinya
  let eventScore = 80; // Baseline
  if (businessProvince) {
    const upcomingProvinceEvents = localEvents.filter(e => {
      const eStartDate = new Date(e.start_date);
      const isUpcoming = eStartDate >= now || (now >= eStartDate && now <= new Date(e.end_date));
      const isSameProvince = e.province_name.toLowerCase().includes(businessProvince.toLowerCase()) || 
                             businessProvince.toLowerCase().includes(e.province_name.toLowerCase());
      return isUpcoming && isSameProvince;
    });

    if (upcomingProvinceEvents.length > 0) {
      // Ada event daerah terdekat! Evaluasi stock level produk
      let isPrepared = true;
      let hasLowStock = false;

      products.forEach(p => {
        if (p.stock <= p.min_stock) {
          hasLowStock = true;
        }
      });

      if (hasLowStock) {
        // Toko belum siap karena ada stok kritis menjelang event daerah
        eventScore = 65;
      } else {
        // Toko siap dengan stok aman
        eventScore = 95;
      }

      // Beri bonus jika ada transaksi baru-baru ini menjelang event
      const hasRecentOrders = orders30d.length > 0;
      if (hasRecentOrders && eventScore === 95) {
        eventScore = 100;
      }
    }
  }
  eventScore = Math.round(eventScore);

  // HITUNG OVERALL SCORE
  const overallScore = Math.round((revenueScore + marginScore + inventoryTurnScore + retentionScore + safetyScore + eventScore) / 6);

  return {
    revenue_score: revenueScore,
    margin_score: marginScore,
    inventory_turn_score: inventoryTurnScore,
    retention_score: retentionScore,
    safety_stock_score: safetyScore,
    event_adaptability_score: eventScore,
    overall_score: overallScore,
  };
}

/**
 * Memberikan rekomendasi tertulis kualitatif (rules-based) jika Gemini offline / fallback
 */
export function getDeterministicBhsRecommendation(breakdown: BHSMetricBreakdown): string[] {
  const recommendations: string[] = [];

  if (breakdown.revenue_score < 60) {
    recommendations.push("Omzet bulanan Anda masih di bawah target regional. Coba buat promosi bundle produk terlaris atau gunakan diskon khusus akhir pekan.");
  }
  if (breakdown.safety_stock_score < 70) {
    recommendations.push("Stok beberapa produk Anda telah menyentuh batas aman (ROP) atau habis. Segera lakukan pengadaan (restock) agar tidak kehilangan potensi penjualan.");
  }
  if (breakdown.inventory_turn_score < 50) {
    recommendations.push("Perputaran stok Anda lambat (overstock). Kurangi pengadaan produk kurang laris dan adakan cuci gudang untuk membebaskan kas toko.");
  }
  if (breakdown.event_adaptability_score < 80) {
    recommendations.push("Terdapat event pariwisata daerah DIY-Jateng terdekat, namun stok Anda kritis. Naikkan stok produk oleh-oleh atau batik Anda segera.");
  }
  if (breakdown.retention_score < 65) {
    recommendations.push("Tingkat pembeli setia rendah. Tawarkan kupon diskon untuk transaksi berikutnya melalui pesan WhatsApp setelah pesanan diselesaikan.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Kesehatan bisnis Anda sangat prima! Pertahankan kinerja pengelolaan stok dan terus ikuti kalender event kebudayaan untuk promosi tematik.");
  }

  return recommendations;
}
