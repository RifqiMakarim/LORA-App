'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Mail,
  Edit2,
  Save,
  Cpu,
  Database,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';
import { updateProfile, updatePassword } from '@/app/actions/profile';

interface ProfileData {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

interface AdminSettingsClientProps {
  initialProfile: ProfileData;
}

export default function AdminSettingsClient({ initialProfile }: AdminSettingsClientProps) {
  const router = useRouter();

  // Profile Form States
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // System Health States (Fluctuating for UI aesthetics)
  const [cpuLoad, setCpuLoad] = useState(28);
  const [ramLoad, setRamLoad] = useState(46);
  const [dbConn, setDbConn] = useState(14);

  // Fluctuating server load simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.max(5, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
      setRamLoad(prev => Math.max(20, Math.min(90, prev + Math.floor(Math.random() * 5) - 2)));
      setDbConn(prev => Math.max(5, Math.min(50, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({ fullName, avatarUrl });
      if (res.error) throw new Error(res.error);

      toast.success('Profil Anda berhasil diperbarui!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Harap masukkan kata sandi baru.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.error) throw new Error(res.error);

      toast.success('Kata sandi berhasil diperbarui!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Pengaturan Akun & Profil
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
          Perbarui foto profil Anda, ubah nama tampilan di platform, dan ganti kata sandi keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
        {/* Profile Card, Picture, and Performance (Left Column / spans 1) */}
        <div className="space-y-6">
          {/* Card 1: Avatar Upload */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="space-y-2 w-full flex flex-col items-center">
              <ImageUpload
                value={avatarUrl || ''}
                mediaType="logo"
                onConfirm={(url) => setAvatarUrl(url)}
                onRemove={() => setAvatarUrl(null)}
                uploadPreset="lora_toko"
                label="Foto Profil Akun"
                helperText="Format JPG/PNG/WEBP (Otomatis WebP 300x300)"
                aspectRatio="square"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 w-full text-left space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ringkasan Akun</h3>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fullName || 'Pengguna LORA'}</span>
                </p>
                <p className="text-[11px] text-slate-505 font-semibold flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                  <span className="truncate">{initialProfile.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Server Performance Indicators */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Status Performa Server</span>
            </h2>

            <div className="space-y-4">
              {/* CPU Load */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" /> Beban CPU Server
                  </span>
                  <span>{cpuLoad}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      cpuLoad > 85 ? 'bg-rose-500' : cpuLoad > 55 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cpuLoad}%` }}
                  />
                </div>
              </div>

              {/* RAM Usage */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-slate-400" /> Konsumsi RAM
                  </span>
                  <span>{ramLoad}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      ramLoad > 80 ? 'bg-rose-500' : ramLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${ramLoad}%` }}
                  />
                </div>
              </div>

              {/* DB Pool Pool */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-slate-400" /> Connection Pool
                  </span>
                  <span>{dbConn} / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${dbConn}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile & Password forms (Right Columns / spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Display Name Profile */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" />
              <span>Perbarui Informasi Akun</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alamat Email (Tetap)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={initialProfile.email}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lengkap Tampilan</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-55 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </form>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Ganti Kata Sandi Keamanan</span>
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-55 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Konfirmasi Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang sandi baru..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-55 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-350 rounded-xl text-xs font-semibold focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{passwordSaving ? 'Memproses...' : 'Ubah Sandi Baru'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
