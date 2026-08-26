'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowDownWideNarrow
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';
import Pagination from '@/components/ui/Pagination';
import { getProductImageWebp } from '@/lib/image-utils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  image_url?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

interface InventoryClientProps {
  products: Product[];
  businessId: string;
}

export default function InventoryClient({
  products,
  businessId,
}: InventoryClientProps) {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 10;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Batik');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinStock, setFormMinStock] = useState('10');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Kategori CRUD State
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Pastikan scroll body & html selalu di-unlock saat modal ditutup atau saat unmount
  useEffect(() => {
    if (!isModalOpen && !isCategoriesModalOpen) {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, [isModalOpen, isCategoriesModalOpen]);

  // Load data kategori dari database saat komponen dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/seller/categories');
        const data = await res.json();
        if (res.ok && data.data) {
          setDbCategories(data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  // Formatter mata uang Rupiah
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const defaultCategories = ['Batik', 'Kuliner', 'Kerajinan', 'Aksesori', 'Lainnya'];

  // Kategori unik dari produk yang ada
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [products]);

  // Gabungkan kategori database (atau default bawaan) dan pastikan "Lainnya" selalu berada di akhir list
  const allCategories = useMemo(() => {
    const list = dbCategories.length > 0 ? dbCategories : [...defaultCategories, ...categoriesList];
    const set = new Set(list);
    const listWithoutLainnya = Array.from(set).filter(c => c !== 'Lainnya');
    return [...listWithoutLainnya, 'Lainnya'];
  }, [dbCategories, categoriesList]);

  // Klasifikasi Status Inventaris per Produk
  const classifiedProducts = useMemo(() => {
    return products.map(p => {
      let status: 'aman' | 'low' | 'habis' | 'overstock' = 'aman';
      let statusText = 'Aman';
      let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      const safetyStock = Math.round(p.min_stock * 0.5); // Safety Stock = 50% dari ROP
      const rop = p.min_stock; // ROP = min_stock

      if (p.stock <= 0) {
        status = 'habis';
        statusText = 'Habis';
        badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (p.stock <= rop) {
        status = 'low';
        statusText = 'Kritis (ROP)';
        badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      } else if (p.stock > rop * 2.5) {
        status = 'overstock';
        statusText = 'Overstock';
        badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
      }

      return {
        ...p,
        safetyStock,
        rop,
        status,
        statusText,
        badgeClass,
      };
    });
  }, [products]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    let total = classifiedProducts.length;
    let low = 0;
    let out = 0;
    let over = 0;

    classifiedProducts.forEach(p => {
      if (p.status === 'low') low++;
      else if (p.status === 'habis') out++;
      else if (p.status === 'overstock') over++;
    });

    return { total, low, out, over };
  }, [classifiedProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return classifiedProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [classifiedProducts, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredProducts, currentPage, ITEMS_PER_PAGE]);

  // Handle Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('Batik');
    setFormPrice('');
    setFormStock('');
    setFormMinStock('10');
    setFormImageUrl('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  // Handle Buka Modal Edit
  const handleOpenEdit = (p: any) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormCategory(p.category || 'Batik');
    setFormPrice(p.price.toString());
    setFormStock(p.stock.toString());
    setFormMinStock(p.min_stock.toString());
    setFormImageUrl(p.image_url || '');
    setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  // Kategori CRUD Handlers
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nama kategori tidak boleh kosong.');
      return;
    }
    if (allCategories.includes(newCategoryName.trim())) {
      toast.error('Kategori sudah terdaftar.');
      return;
    }

    try {
      const res = await fetch('/api/seller/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kategori');

      toast.success('Kategori baru ditambahkan ke database!');
      setDbCategories(prev => [...prev, newCategoryName.trim()]);
      setNewCategoryName('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan kategori');
    }
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Nama kategori baru tidak boleh kosong.');
      return;
    }
    if (oldName === newName) {
      setEditingCategoryIndex(null);
      return;
    }

    try {
      const res = await fetch('/api/seller/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCategory: oldName, newCategory: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah kategori');

      toast.success('Kategori berhasil diperbarui!');
      setDbCategories(prev => prev.map(c => c === oldName ? newName.trim() : c));
      setEditingCategoryIndex(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui kategori');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (catName === 'Lainnya') {
      toast.error('Kategori "Lainnya" adalah kategori default sistem dan tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"? Produk dengan kategori ini akan dipindahkan ke "Lainnya".`)) return;

    try {
      const res = await fetch(`/api/seller/categories?category=${encodeURIComponent(catName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus kategori');

      toast.success('Kategori berhasil dihapus.');
      setDbCategories(prev => prev.filter(c => c !== catName));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus kategori');
    }
  };

  // Handle Delete Produk
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const res = await fetch(`/api/seller/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');

      toast.success('Produk berhasil dihapus!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus produk');
    }
  };

  // Handle Toggle Active/Status Produk
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/seller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status');

      toast.success(currentActive ? 'Produk dinonaktifkan dari etalase.' : 'Produk diaktifkan di etalase.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status aktif');
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formStock) {
      toast.error('Nama, harga, dan stok wajib diisi.');
      return;
    }

    const priceNum = Number(formPrice);
    const stockNum = Number(formStock);
    const minStockNum = Number(formMinStock);

    if (priceNum < 0 || stockNum < 0 || minStockNum < 0) {
      toast.error('Harga, stok awal, dan batas aman ROP tidak boleh bernilai negatif.');
      return;
    }

    setSubmitting(true);
    const payload = {
      id: editingId,
      name: formName,
      category: formCategory,
      price: priceNum,
      stock: stockNum,
      min_stock: minStockNum,
      image_url: formImageUrl || null,
      description: formDescription || null,
    };

    try {
      const url = '/api/seller/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan produk');

      toast.success(editingId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
            Manajemen Inventaris & Stok
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
            Kelola produk etalase toko Anda, lengkapi foto produk, pantau ROP (Reorder Point), dan dapatkan notifikasi otomatis saat stok mendekati batas kritis.
          </p>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsCategoriesModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-indigo-950 text-xs font-bold rounded-2xl border border-slate-200 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Kelola Kategori</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-2xl shadow-lg shadow-terracotta/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
            <p className="text-xl sm:text-2xl font-outfit font-extrabold text-slate-900">{stats.total} Item</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stok Kritis (ROP)</p>
            <p className="text-xl sm:text-2xl font-outfit font-extrabold text-amber-500">{stats.low} Item</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stok Habis</p>
            <p className="text-xl sm:text-2xl font-outfit font-extrabold text-rose-600">{stats.out} Item</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overstock</p>
            <p className="text-xl sm:text-2xl font-outfit font-extrabold text-blue-600">{stats.over} Item</p>
          </div>
        </div>
      </div>

      {/* ROP Alert Box */}
      {stats.low + stats.out > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Peringatan Restock Otomatis (ROP Alert)</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Terdapat **{stats.low} produk** di bawah Reorder Point (ROP) dan **{stats.out} produk** yang kehabisan stok. Segera lakukan pemesanan ulang (restock) ke supplier untuk menghindari hilangnya peluang omzet.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-350 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-300 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-40 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowDownWideNarrow className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-40 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="aman">Aman</option>
              <option value="low">Kritis (ROP)</option>
              <option value="habis">Habis</option>
              <option value="overstock">Overstock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Catalog Table List */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
          Katalog Produk Etalase ({filteredProducts.length})
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/85">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Info Produk</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Stok Aktual</th>
                <th className="p-3">Safety Stock</th>
                <th className="p-3">ROP (Batas Aman)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 ${!p.is_active ? 'opacity-50 bg-slate-50/20' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            <img src={getProductImageWebp(p.image_url, 150)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400 stroke-1" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-sm font-outfit font-black ${p.stock <= p.rop ? 'text-rose-600' : 'text-slate-800'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-semibold whitespace-nowrap">
                      {p.safetyStock} item
                    </td>
                    <td className="p-3 text-slate-500 font-semibold whitespace-nowrap">
                      {p.rop} item
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md border ${p.badgeClass}`}>
                        {p.statusText}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleActive(p.id, p.is_active)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_active ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-terracotta hover:text-amber-700 hover:bg-amber-50'
                          }`}
                          title={p.is_active ? 'Sembunyikan dari Etalase' : 'Tampilkan di Etalase'}
                        >
                          {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-650 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Komponen Paginasi Stok */}
        {totalPages > 1 && (
          <div className="pt-3 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="produk"
            />
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900">
                {editingId ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kain Batik Tulis Parang"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Harga (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Contoh: 150000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-300 no-spinner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 50"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Batas Aman ROP</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 10"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deskripsi Singkat</label>
                <textarea
                  placeholder="Isi spesifikasi produk, keunggulan, atau ukuran..."
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-300 resize-none"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div className="space-y-1.5">
                <ImageUpload
                  value={formImageUrl}
                  onConfirm={(url) => setFormImageUrl(url)}
                  onRemove={() => setFormImageUrl('')}
                  uploadPreset="lora_toko"
                  mediaType="product"
                  label="Foto Produk"
                  helperText="Unggah foto produk terbaik Anda menggunakan Cloudinary (Maks 5MB, Otomatis WebP)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl text-xs font-bold shadow-md shadow-terracotta/20 transition-all cursor-pointer disabled:opacity-55"
                >
                  {submitting ? 'Sedang Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories CRUD Modal */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-outfit font-extrabold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-indigo-950" /> Kelola Kategori Produk
              </h3>
              <button
                onClick={() => {
                  setIsCategoriesModalOpen(false);
                  setEditingCategoryIndex(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add Category Form */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daftar Kategori Aktif ({allCategories.length})</label>
              <div className="border border-slate-200/80 rounded-2xl divide-y divide-slate-100 max-h-[40vh] overflow-y-auto">
                {allCategories.map((cat, idx) => {
                  const isDefault = defaultCategories.includes(cat);
                  const isEditing = editingCategoryIndex === idx;

                  return (
                    <div key={cat} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 focus:border-slate-350 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat, editingCategoryName)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryIndex(null)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{cat}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryIndex(idx);
                                setEditingCategoryName(cat);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-550 hover:text-indigo-650 transition-colors"
                              title="Ubah Nama Kategori"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {cat !== 'Lainnya' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
