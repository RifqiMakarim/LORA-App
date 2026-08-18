import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  fillTimeSeriesGaps,
  DailySalesPoint,
} from '@/lib/forecast/holtWinters';
import { autoTuneParams } from '@/lib/forecast/backtesting';

/**
 * POST /api/forecast/calibrate
 * 
 * Manual trigger auto-tuning parameter Holt-Winters via grid search 64 kombinasi.
 * Menyimpan hasilnya ke tabel sales_forecasts sebagai tuned_params.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Anda harus login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const businessId = body.businessId as string | undefined;
    const horizonDays = (body.horizon === '15_days') ? 15 : 7;

    // Cari business
    let targetBusinessId = businessId || null;
    if (!targetBusinessId) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();
      if (biz) targetBusinessId = biz.id;
    }

    if (!targetBusinessId) {
      return NextResponse.json({ error: 'Tidak ditemukan toko untuk dikalibrasi.' }, { status: 404 });
    }

    // Fetch data historis
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - 90);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('business_id', targetBusinessId)
      .eq('order_status', 'completed')
      .eq('payment_status', 'paid')
      .gte('created_at', lookbackDate.toISOString())
      .order('created_at', { ascending: true });

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data transaksi untuk kalibrasi.' }, { status: 400 });
    }

    // Agregasi & gap fill
    const dateGroupMap = new Map<string, { total: number; count: number }>();
    for (const o of orders) {
      const dateStr = new Date(o.created_at).toISOString().split('T')[0];
      if (!dateGroupMap.has(dateStr)) {
        dateGroupMap.set(dateStr, { total: 0, count: 0 });
      }
      const curr = dateGroupMap.get(dateStr)!;
      curr.total += Number(o.total_amount || 0);
      curr.count += 1;
    }

    const rawHistorical: DailySalesPoint[] = Array.from(dateGroupMap.entries()).map(([date, val]) => ({
      date,
      sales_amount: val.total,
      order_count: val.count,
    }));

    const filledSeries = fillTimeSeriesGaps(rawHistorical, rawHistorical.length);
    const salesValues = filledSeries.map(p => p.sales_amount);

    if (salesValues.length < 14) {
      return NextResponse.json({
        error: 'Data terlalu sedikit untuk kalibrasi. Butuh minimal 14 hari transaksi.',
        data_days: salesValues.length,
        minimum_required: 14,
      }, { status: 400 });
    }

    // Jalankan Grid Search Auto-Tuning (64 kombinasi α/β/γ)
    const tuned = autoTuneParams(salesValues, horizonDays);

    // Simpan ke tabel sales_forecasts sebagai cache parameter
    const { error: saveError } = await supabase.from('sales_forecasts').insert({
      business_id: targetBusinessId,
      forecast_type: 'tuned_params',
      forecast_data: {
        alpha: tuned.alpha,
        beta: tuned.beta,
        gamma: tuned.gamma,
        mapeValidated: tuned.mapeValidated,
        tunedAt: tuned.tunedAt,
        horizon: horizonDays,
        dataDays: salesValues.length,
      },
    });

    if (saveError) {
      console.warn('Gagal menyimpan tuned params ke DB:', saveError.message);
      // Tetap kembalikan hasilnya meskipun gagal simpan
    }

    return NextResponse.json({
      success: true,
      message: 'Kalibrasi model berhasil! Parameter optimal telah ditemukan.',
      tuned_params: {
        alpha: tuned.alpha,
        beta: tuned.beta,
        gamma: tuned.gamma,
      },
      mape_validated: Math.round(tuned.mapeValidated * 10) / 10,
      mape_interpretation: tuned.mapeValidated <= 15
        ? 'Sangat Baik'
        : tuned.mapeValidated <= 25
          ? 'Baik'
          : tuned.mapeValidated <= 40
            ? 'Cukup'
            : 'Perlu Data Lebih',
      data_days_used: salesValues.length,
      grid_search_combinations: 64,
      tuned_at: tuned.tunedAt,
    });

  } catch (error) {
    console.error('Error in calibrate API:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Gagal melakukan kalibrasi: ${errMsg}` }, { status: 500 });
  }
}
