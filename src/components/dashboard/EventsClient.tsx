'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

interface LocalEvent {
  id: string;
  title: string;
  province_name: string;
  city_name: string | null;
  start_date: string;
  end_date: string;
  description: string | null;
  expected_tourist_impact: 'low' | 'medium' | 'high' | 'massive';
}

interface EventsClientProps {
  events: LocalEvent[];
  isAdmin: boolean;
  businessProvince: string | null;
  businessName: string | null;
}

export default function EventsClient({
  events,
  isAdmin,
  businessProvince,
  businessName,
}: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // Filter & Search Logic
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.city_name && e.city_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvince = selectedProvince === 'all' || e.province_name === selectedProvince;

    return matchesSearch && matchesProvince;
  });

  // Format Tanggal Lokal
  const formatDateRange = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    
    if (start === end) {
      return sDate.toLocaleDateString('id-ID', options);
    }
    return `${sDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${eDate.toLocaleDateString('id-ID', options)}`;
  };

  // Generate Strategi Penjualan berdasarkan dampak event
  const getEventRecommendation = (event: LocalEvent) => {
    const isNearby = businessProvince && event.province_name.toLowerCase().includes(businessProvince.toLowerCase());
    
    let advice = '';
    let multiplierText = '';
    
    switch (event.expected_tourist_impact) {
      case 'massive':
        advice = 'Tingkatkan kapasitas produksi dan persediaan produk khas (Batik/Kuliner) hingga 75%. Siapkan promosi bertema kebudayaan dan perpanjang jam operasional toko.';
        multiplierText = 'Proyeksi Kenaikan: +75% Permintaan';
        break;
      case 'high':
        advice = 'Siapkan stok tambahan sekitar 45% dari kebutuhan normal harian. Tawarkan diskon bundle menarik untuk menarik pembeli wisatawan.';
        multiplierText = 'Proyeksi Kenaikan: +45% Permintaan';
        break;
      case 'medium':
        advice = 'Lakukan penyesuaian stok ringan (+25%), khususnya untuk produk oleh-oleh atau produk paling laris di etalase digital.';
        multiplierText = 'Proyeksi Kenaikan: +25% Permintaan';
        break;
      case 'low':
      default:
        advice = 'Pantau penjualan normal, pertimbangkan kampanye promo kecil untuk menarik pengunjung komunitas lokal yang hadir.';
        multiplierText = 'Proyeksi Kenaikan: +10% Permintaan';
        break;
    }

    return { advice, multiplierText, isNearby };
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation / Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Kalender Event & Tren Regional
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
          Gunakan jadwal agenda pariwisata DIY & Jawa Tengah terdekat untuk mengantisipasi lonjakan permintaan pembeli dan merencanakan promo tematik.
        </p>
      </div>

      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari event, kota, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-350 rounded-2xl text-xs font-semibold focus:outline-hidden transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full sm:w-44 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden"
            >
              <option value="all">Semua Wilayah</option>
              <option value="DI Yogyakarta">DI Yogyakarta</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const { advice, multiplierText, isNearby } = getEventRecommendation(event);
              
              // Warna badge dampak
              let impactBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              if (event.expected_tourist_impact === 'massive') impactBadgeColor = 'bg-rose-50 border-rose-200 text-rose-700';
              else if (event.expected_tourist_impact === 'high') impactBadgeColor = 'bg-amber-50 border-amber-200 text-amber-800';
              else if (event.expected_tourist_impact === 'medium') impactBadgeColor = 'bg-blue-50 border-blue-200 text-blue-700';
              
              return (
                <div key={event.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all relative overflow-hidden">
                  {/* Badge Wilayah Terdekat */}
                  {isNearby && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-bl-2xl">
                      📍 Wilayah Anda
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md border ${impactBadgeColor}`}>
                        Dampak: {event.expected_tourist_impact}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-terracotta" />
                        {event.city_name ? `${event.city_name}, ` : ''}{event.province_name}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(event.start_date, event.end_date)}
                    </p>
                    
                    {event.description && (
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* AI Recommendation Box */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-950 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Strategi LORA
                      </span>
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase">
                        {multiplierText}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {advice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 shadow-xs text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto stroke-1.5" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada event ditemukan</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">Coba ubah kata kunci pencarian Anda atau filter wilayah provinsi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
