'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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

interface AdminEventsClientProps {
  events: LocalEvent[];
}

export default function AdminEventsClient({ events }: AdminEventsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formProvince, setFormProvince] = useState('DI Yogyakarta');
  const [formCity, setFormCity] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formImpact, setFormImpact] = useState<'low' | 'medium' | 'high' | 'massive'>('medium');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search Logic
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.city_name && e.city_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvince = selectedProvince === 'all' || e.province_name === selectedProvince;

    return matchesSearch && matchesProvince;
  });

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormProvince('DI Yogyakarta');
    setFormCity('');
    setFormStartDate('');
    setFormEndDate('');
    setFormImpact('medium');
    setFormDescription('');
  };

  // Submit Form (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formStartDate || !formEndDate) {
      toast.error('Harap isi judul event dan rentang tanggal.');
      return;
    }

    setSubmitting(true);
    const payload = {
      id: editingId,
      title: formTitle,
      province_name: formProvince,
      city_name: formCity || null,
      start_date: formStartDate,
      end_date: formEndDate,
      expected_tourist_impact: formImpact,
      description: formDescription || null,
    };

    try {
      const url = '/api/admin/events';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

      toast.success(editingId ? 'Event berhasil diperbarui!' : 'Event baru berhasil ditambahkan!');
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan event');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Trigger
  const handleEdit = (event: LocalEvent) => {
    setEditingId(event.id);
    setFormTitle(event.title);
    setFormProvince(event.province_name);
    setFormCity(event.city_name || '');
    setFormStartDate(event.start_date);
    setFormEndDate(event.end_date);
    setFormImpact(event.expected_tourist_impact);
    setFormDescription(event.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');

      toast.success('Event berhasil dihapus.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus event');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Pengelolaan Kalender Event & Pariwisata
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
          Tambahkan, perbarui, atau hapus kegiatan budaya dan agenda wisata DIY & Jawa Tengah yang memicu mobilisasi massa wisatawan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CRUD Form (Left Column) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {editingId ? '📝 Edit Data Event' : '✨ Tambah Event Baru'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-[10px] font-extrabold uppercase text-slate-400 hover:text-slate-600"
              >
                Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Kegiatan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Dieng Culture Festival"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Provinsi</label>
                <select
                  value={formProvince}
                  onChange={(e) => {
                    setFormProvince(e.target.value);
                    setFormCity(''); // Reset selected city
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value="DI Yogyakarta">DI Yogyakarta</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kabupaten/Kota</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  {(REGIONAL_CITIES[formProvince] || []).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estimasi Dampak Wisatawan</label>
              <select
                value={formImpact}
                onChange={(e) => setFormImpact(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
              >
                <option value="low">Low (+10% tourist surge)</option>
                <option value="medium">Medium (+25% tourist surge)</option>
                <option value="high">High (+45% tourist surge)</option>
                <option value="massive">Massive (+75% tourist surge)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deskripsi Event & Info Penunjang</label>
              <textarea
                placeholder="Isi rincian event dan anjuran bagi pedagang..."
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-300 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan Event'}</span>
            </button>
          </form>
        </div>

        {/* CRUD Table List (Right Column - Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Master Direktori Event ({events.length})
            </h2>

            {/* Table Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full sm:w-32 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
              >
                <option value="all">Semua Provinsi</option>
                <option value="DI Yogyakarta">DI Yogyakarta</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Kegiatan</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Dampak</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{e.title}</p>
                        {e.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{e.description}</p>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">
                        {e.city_name ? `${e.city_name}, ` : ''}{e.province_name}
                      </td>
                      <td className="p-3 text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(e.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(e.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md border uppercase ${
                          e.expected_tourist_impact === 'massive' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          e.expected_tourist_impact === 'high' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          e.expected_tourist_impact === 'medium' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {e.expected_tourist_impact}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(e)}
                            className="p-1 text-slate-550 hover:text-indigo-650 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Hapus Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                      Tidak ada data event kebudayaan terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
