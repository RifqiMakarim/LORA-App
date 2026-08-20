'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Info,
  CalendarDays
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

const REGIONAL_CITIES: Record<string, string[]> = {
  'DI Yogyakarta': [
    'Kabupaten Bantul',
    'Kabupaten Gunungkidul',
    'Kabupaten Kulon Progo',
    'Kabupaten Sleman',
    'Kota Yogyakarta'
  ],
  'Jawa Tengah': [
    'Kabupaten Banjarnegara',
    'Kabupaten Banyumas',
    'Kabupaten Batang',
    'Kabupaten Blora',
    'Kabupaten Boyolali',
    'Kabupaten Brebes',
    'Kabupaten Cilacap',
    'Kabupaten Demak',
    'Kabupaten Grobogan',
    'Kabupaten Jepara',
    'Kabupaten Karanganyar',
    'Kabupaten Kebumen',
    'Kabupaten Kendal',
    'Kabupaten Klaten',
    'Kabupaten Kudus',
    'Kabupaten Magelang',
    'Kabupaten Pati',
    'Kabupaten Pekalongan',
    'Kabupaten Pemalang',
    'Kabupaten Purbalingga',
    'Kabupaten Purworejo',
    'Kabupaten Rembang',
    'Kabupaten Semarang',
    'Kabupaten Sragen',
    'Kabupaten Sukoharjo',
    'Kabupaten Tegal',
    'Kabupaten Temanggung',
    'Kabupaten Wonogiri',
    'Kabupaten Wonosobo',
    'Kota Magelang',
    'Kota Pekalongan',
    'Kota Salatiga',
    'Kota Semarang',
    'Kota Surakarta',
    'Kota Tegal'
  ]
};

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
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeView, setActiveView] = useState<'grid' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Ambil Kabupaten/Kota berdasarkan provinsi yang dipilih dari data real
  const uniqueCities = selectedProvince === 'all' ? [] : (REGIONAL_CITIES[selectedProvince] || []);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity('all');
    setSelectedDate(null); // Reset date selection
  };

  // Filter & Search Logic
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.city_name && e.city_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvince = selectedProvince === 'all' || e.province_name === selectedProvince;
    const matchesCity = selectedProvince === 'all' || selectedCity === 'all' || e.city_name === selectedCity;

    return matchesSearch && matchesProvince && matchesCity;
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

  // Safe formatting date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getEventsForDate = (date: Date) => {
    const targetStr = formatDateString(date);
    return filteredEvents.filter((e) => {
      return targetStr >= e.start_date && targetStr <= e.end_date;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate Calendar cells
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  let startDay = startOfMonth.getDay();
  // Adjust Monday as 0, Sunday as 6
  startDay = startDay === 0 ? 6 : startDay - 1;

  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Padding bulan sebelumnya
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({
      day: prevDaysInMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevDaysInMonth - i),
    });
  }

  // Bulan sekarang
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Padding bulan berikutnya
  const nextDaysNeeded = 42 - cells.length;
  for (let i = 1; i <= nextDaysNeeded; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
            Kalender Event & Tren Regional
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
            Gunakan jadwal agenda pariwisata DIY & Jawa Tengah terdekat untuk mengantisipasi lonjakan permintaan pembeli dan merencanakan promo tematik.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start md:self-center">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'grid'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Event & Tren
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'calendar'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kalender Event & Tren
          </button>
        </div>
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
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full sm:w-44 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Wilayah</option>
                <option value="DI Yogyakarta">DI Yogyakarta</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
              </select>
            </div>

            {selectedProvince !== 'all' && (
              <div className="w-full sm:w-auto animate-in fade-in slide-in-from-top-1 duration-200">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full sm:w-48 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Kabupaten/Kota</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic View rendering */}
        {activeView === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Calendar Grid Container */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-950" />
                  {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-650" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3.5 py-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-650" />
                  </button>
                </div>
              </div>

              {/* Day header */}
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
                <div>Min</div>
              </div>

              {/* Days cells */}
              <div className="grid grid-cols-7 gap-2">
                {cells.map((cell, idx) => {
                  const dayEvents = getEventsForDate(cell.date);
                  const isToday = formatDateString(cell.date) === formatDateString(new Date());
                  const isSelected = selectedDate && formatDateString(cell.date) === formatDateString(selectedDate);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`min-h-[85px] p-2 rounded-2xl border flex flex-col justify-between transition-all select-none ${
                        cell.isCurrentMonth
                          ? isSelected
                            ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/30'
                          : 'bg-slate-550/5 border-slate-100/70 text-slate-400/70'
                      } ${isToday ? 'ring-2 ring-amber-500/50 border-amber-300' : ''} cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${
                          isToday 
                            ? 'bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow-xs'
                            : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400/70'
                        }`}>
                          {cell.day}
                        </span>
                        
                        {/* Mobile count indicator */}
                        {dayEvents.length > 0 && (
                          <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-indigo-650 animate-pulse" />
                        )}
                      </div>

                      {/* Desktop Event list inside cell */}
                      <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden max-h-[52px]">
                        {dayEvents.slice(0, 2).map((event) => {
                          let badgeColor = 'bg-slate-100 text-slate-650 border-slate-200';
                          if (event.expected_tourist_impact === 'massive') badgeColor = 'bg-rose-50 border-rose-200 text-rose-700';
                          else if (event.expected_tourist_impact === 'high') badgeColor = 'bg-amber-50 border-amber-200 text-amber-800';
                          else if (event.expected_tourist_impact === 'medium') badgeColor = 'bg-blue-50 border-blue-200 text-blue-700';

                          return (
                            <div
                              key={event.id}
                              title={event.title}
                              className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md border truncate leading-tight ${badgeColor}`}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[8.5px] text-slate-400 font-extrabold pl-1">
                            +{dayEvents.length - 2} lagi
                          </div>
                        )}
                      </div>

                      {/* Tablet dot indicator */}
                      {dayEvents.length > 0 && (
                        <div className="hidden sm:only:flex md:hidden flex-row gap-0.5 justify-end mt-1">
                          {dayEvents.slice(0, 3).map((event) => {
                            let dotColor = 'bg-slate-400';
                            if (event.expected_tourist_impact === 'massive') dotColor = 'bg-rose-500';
                            else if (event.expected_tourist_impact === 'high') dotColor = 'bg-amber-500';
                            else if (event.expected_tourist_impact === 'medium') dotColor = 'bg-blue-500';
                            return <span key={event.id} className={`w-1 h-1 rounded-full ${dotColor}`} />;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Date Details Panel */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                    Detail Tanggal
                  </span>
                  <h3 className="text-sm sm:text-base font-outfit font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    {selectedDate ? (
                      <>
                        <Calendar className="w-4 h-4 text-indigo-950" />
                        {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </>
                    ) : (
                      "Pilih Tanggal Kalender"
                    )}
                  </h3>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  {selectedDate ? (
                    (() => {
                      const dateEvents = getEventsForDate(selectedDate);
                      if (dateEvents.length > 0) {
                        return (
                          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                            {dateEvents.map((event) => {
                              const { advice, multiplierText, isNearby } = getEventRecommendation(event);
                              let impactColor = 'bg-slate-100 text-slate-700 border-slate-200';
                              if (event.expected_tourist_impact === 'massive') impactColor = 'bg-rose-50 border-rose-200 text-rose-700';
                              else if (event.expected_tourist_impact === 'high') impactColor = 'bg-amber-50 border-amber-200 text-amber-800';
                              else if (event.expected_tourist_impact === 'medium') impactColor = 'bg-blue-50 border-blue-200 text-blue-700';

                              return (
                                <div key={event.id} className="border border-slate-150 rounded-2xl p-4 space-y-3 relative hover:border-slate-300 transition-all">
                                  {isNearby && (
                                    <span className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-bl-xl">
                                      📍 Toko Anda
                                    </span>
                                  )}
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded border ${impactColor}`}>
                                        {event.expected_tourist_impact}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3 text-terracotta" />
                                        {event.city_name ? `${event.city_name}` : event.province_name}
                                      </span>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                                      {event.title}
                                    </h4>
                                  </div>

                                  {/* AI Recommendation Box */}
                                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] font-extrabold">
                                      <span className="text-indigo-950 flex items-center gap-0.5">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                        Rekomendasi
                                      </span>
                                      <span className="text-emerald-600">
                                        {multiplierText}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-550 leading-relaxed font-medium">
                                      {advice}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center py-12 space-y-3">
                            <Info className="w-8 h-8 text-slate-350 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">Tidak Ada Event Regional</p>
                            <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                              Tidak ada agenda pariwisata atau kegiatan massal yang tercatat pada tanggal ini. Penjualan diproyeksikan stabil.
                            </p>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <Calendar className="w-8 h-8 text-indigo-950/20 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Pilih Tanggal</p>
                      <p className="text-[10px] text-slate-450 max-w-[200px] mx-auto">
                        Silakan klik salah satu tanggal pada kalender untuk melihat detail event dan rekomendasi strategi LORA.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Tampilkan Semua Event Bulan Ini
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Grid View */
          filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {filteredEvents.map((event) => {
                const { advice, multiplierText, isNearby } = getEventRecommendation(event);
                
                // Warna badge dampak
                let impactBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                if (event.expected_tourist_impact === 'massive') impactBadgeColor = 'bg-rose-50 border-rose-200 text-rose-700';
                else if (event.expected_tourist_impact === 'high') impactBadgeColor = 'bg-amber-50 border-amber-200 text-amber-800';
                else if (event.expected_tourist_impact === 'medium') impactBadgeColor = 'bg-blue-50 border-blue-200 text-blue-700';
                
                return (
                  <div key={event.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-350 transition-all relative overflow-hidden">
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
                        <p className="text-slate-650 text-xs leading-relaxed line-clamp-3 mt-2 font-medium">
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
                      <p className="text-slate-650 text-[11px] leading-relaxed font-medium">
                        {advice}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 shadow-xs text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-350 mx-auto stroke-1.5" />
              <h3 className="text-sm font-bold text-slate-800">Tidak ada event ditemukan</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">Coba ubah kata kunci pencarian Anda atau filter wilayah provinsi/kabupaten.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
