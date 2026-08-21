'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Search,
  Shield,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Calendar,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface ProfileItem {
  id: string;
  fullName: string;
  phone: string;
  isBuyer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  province: string;
  city: string;
  contact: string;
  ownerName: string;
  createdAt: string;
}

interface AdminUsersStoresClientProps {
  profiles: ProfileItem[];
  businesses: BusinessItem[];
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsersStoresClient({
  profiles,
  businesses,
}: AdminUsersStoresClientProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [storePage, setStorePage] = useState(1);

  // Filtering
  const filteredProfiles = profiles.filter(
    (p) =>
      p.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.phone.includes(userSearch) ||
      p.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      b.slug.toLowerCase().includes(storeSearch.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(storeSearch.toLowerCase()) ||
      b.city.toLowerCase().includes(storeSearch.toLowerCase())
  );

  // Pagination for Users
  const totalUserPages = Math.max(1, Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE));
  const currentUserPage = Math.min(userPage, totalUserPages);
  const userStartIndex = (currentUserPage - 1) * ITEMS_PER_PAGE;
  const paginatedProfiles = filteredProfiles.slice(userStartIndex, userStartIndex + ITEMS_PER_PAGE);

  // Pagination for Stores
  const totalStorePages = Math.max(1, Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE));
  const currentStorePage = Math.min(storePage, totalStorePages);
  const storeStartIndex = (currentStorePage - 1) * ITEMS_PER_PAGE;
  const paginatedBusinesses = filteredBusinesses.slice(storeStartIndex, storeStartIndex + ITEMS_PER_PAGE);

  const handleUserSearchChange = (val: string) => {
    setUserSearch(val);
    setUserPage(1);
  };

  const handleStoreSearchChange = (val: string) => {
    setStoreSearch(val);
    setStorePage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
            Direktori Pengguna & Toko UMKM
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
            Lihat daftar lengkap pengguna yang terdaftar di platform LORA beserta data UMKM yang telah go-digital di DIY & Jawa Tengah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/50 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pengguna ({profiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'stores'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Toko UMKM ({businesses.length})</span>
          </button>
        </div>
      </div>

      {/* Users Tab View */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Audit Data Pengguna
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, ID, atau telepon..."
                value={userSearch}
                onChange={(e) => handleUserSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID Pengguna</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Kontak Telepon</th>
                  <th className="p-3">Tanggal Registrasi</th>
                  <th className="p-3 text-center">Peran Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedProfiles.length > 0 ? (
                  paginatedProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-[10px] text-slate-400 tracking-tight">
                        {p.id}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{p.fullName}</p>
                      </td>
                      <td className="p-3 text-slate-500 font-semibold flex items-center gap-1.5 pt-4">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.phone}
                      </td>
                      <td className="p-3 text-slate-400 font-semibold">
                        {new Date(p.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                        {p.isAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-extrabold uppercase rounded-md">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                        {p.isSeller && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-extrabold uppercase rounded-md">
                            Seller
                          </span>
                        )}
                        {p.isBuyer && (
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 text-[8px] font-extrabold uppercase rounded-md">
                            Buyer
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                      Tidak ada pengguna ditemukan dengan kata kunci tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Users */}
          {filteredProfiles.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-800">{userStartIndex + 1}</span> - <span className="font-bold text-slate-800">{Math.min(userStartIndex + ITEMS_PER_PAGE, filteredProfiles.length)}</span> dari <span className="font-bold text-slate-800">{filteredProfiles.length}</span> pengguna
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setUserPage(1)}
                  disabled={currentUserPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentUserPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalUserPages <= 5) return true;
                      return Math.abs(page - currentUserPage) <= 1 || page === 1 || page === totalUserPages;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const isGap = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {isGap && <span className="text-xs text-slate-400 px-1">...</span>}
                          <button
                            type="button"
                            onClick={() => setUserPage(page)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              currentUserPage === page
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setUserPage((prev) => Math.min(totalUserPages, prev + 1))}
                  disabled={currentUserPage >= totalUserPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUserPage(totalUserPages)}
                  disabled={currentUserPage >= totalUserPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stores Tab View */}
      {activeTab === 'stores' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Audit Data Toko UMKM
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari toko, pemilik, kota..."
                value={storeSearch}
                onChange={(e) => handleStoreSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Toko UMKM</th>
                  <th className="p-3">Pemilik (Owner)</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3">Tanggal Onboarding</th>
                  <th className="p-3 text-center">Tautan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedBusinesses.length > 0 ? (
                  paginatedBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{b.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">/{b.slug}</p>
                      </td>
                      <td className="p-3 text-slate-700 font-bold">
                        {b.ownerName}
                      </td>
                      <td className="p-3 text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                          <span>{b.city}, {b.province}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-semibold">
                        {b.contact}
                      </td>
                      <td className="p-3 text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            {new Date(b.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/toko/${b.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-[10px] font-bold rounded-lg transition-all"
                          title="Buka Etalase Toko"
                        >
                          <span>Etalase</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                      Tidak ada toko UMKM ditemukan dengan kriteria pencarian tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Stores */}
          {filteredBusinesses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-800">{storeStartIndex + 1}</span> - <span className="font-bold text-slate-800">{Math.min(storeStartIndex + ITEMS_PER_PAGE, filteredBusinesses.length)}</span> dari <span className="font-bold text-slate-800">{filteredBusinesses.length}</span> toko
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStorePage(1)}
                  disabled={currentStorePage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStorePage((prev) => Math.max(1, prev - 1))}
                  disabled={currentStorePage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalStorePages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalStorePages <= 5) return true;
                      return Math.abs(page - currentStorePage) <= 1 || page === 1 || page === totalStorePages;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const isGap = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {isGap && <span className="text-xs text-slate-400 px-1">...</span>}
                          <button
                            type="button"
                            onClick={() => setStorePage(page)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              currentStorePage === page
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setStorePage((prev) => Math.min(totalStorePages, prev + 1))}
                  disabled={currentStorePage >= totalStorePages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStorePage(totalStorePages)}
                  disabled={currentStorePage >= totalStorePages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

