'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Terminal,
  Activity,
  AlertOctagon,
  RefreshCw,
  Sliders,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface LogItem {
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [rateLimit, setRateLimit] = useState(60);
  const [logLevel, setLogLevel] = useState<'info' | 'warn' | 'error'>('info');
  
  // System Health States
  const [cpuLoad, setCpuLoad] = useState(24);
  const [ramLoad, setRamLoad] = useState(48);
  const [dbConn, setDbConn] = useState(12);

  // Terminal Console Logs
  const [logs, setLogs] = useState<LogItem[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Simulate server logs
  useEffect(() => {
    const initialLogs: LogItem[] = [
      { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'LORA Admin System Core initialized.' },
      { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'RLS (Row Level Security) checked on tables: profiles, businesses, products, orders.' },
      { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'HOLT-WINTERS Hybrid Forecasting Model calibrated successfully (MAPE = 3.82%).' },
      { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'TemanQRIS API Gateway linked. Fallback Native EMVCo QR Generator active.' },
      { timestamp: new Date().toLocaleTimeString(), type: 'warn', message: 'Cloudinary credentials configured on client preset "lora_toko".' }
    ];
    setLogs(initialLogs);
  }, []);

  // Simulate real-time metric updates & logs
  useEffect(() => {
    const interval = setInterval(() => {
      // Metrics fluctuation
      setCpuLoad(prev => Math.max(5, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
      setRamLoad(prev => Math.max(20, Math.min(90, prev + Math.floor(Math.random() * 5) - 2)));
      setDbConn(prev => Math.max(5, Math.min(50, prev + Math.floor(Math.random() * 7) - 3)));

      // Random logs injection
      const logTemplates: LogItem[] = [
        { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'API Request GET /api/ai/bhs processed successfully.' },
        { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'BHS score calculated & saved to db for Batik Kencana Jogja.' },
        { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Synchronizing regional tourism calendar data with local_events table.' },
        { timestamp: new Date().toLocaleTimeString(), type: 'warn', message: 'High request latency detected on Gemini API Chat Route (2.4s).' },
        { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Product inventory safety limits checked. 3 items flag low ROP.' }
      ];

      const roll = Math.random();
      if (roll > 0.6) {
        const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        setLogs(prev => [...prev.slice(-49), randomLog]); // Keep last 50 logs
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSaveSettings = () => {
    toast.success('Pengaturan administrasi sistem berhasil diperbarui!');
    const newLog: LogItem = {
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: `System settings saved: Maintenance=${maintenanceMode}, Sandbox=${sandboxMode}, RateLimit=${rateLimit} req/min.`
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleClearCache = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Membersihkan cache sistem...',
        success: 'Cache dan session cache berhasil dibersihkan!',
        error: 'Gagal membersihkan cache',
      }
    );
    const newLog: LogItem = {
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'System buffer cache cleared by administrator.'
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">
          Pengaturan Sistem LORA
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
          Kelola konfigurasi global aplikasi, parameter server sandbox, batasan API rate-limit, serta pantau aktivitas log backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Control Settings */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Konfigurasi Global Platform</span>
            </h2>

            <div className="space-y-5">
              {/* Option 1: Maintenance Mode */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Mode Pemeliharaan (Maintenance Mode)
                  </h3>
                  <p className="text-[11px] text-slate-405 leading-relaxed mt-0.5">
                    Kunci seluruh etalase digital dan dashboard untuk pemeliharaan server database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  {maintenanceMode ? (
                    <ToggleRight className="w-12 h-12 text-rose-500 fill-rose-50" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Option 2: Sandbox Mode */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Mode Sandbox API TemanQRIS & Gemini
                  </h3>
                  <p className="text-[11px] text-slate-405 leading-relaxed mt-0.5">
                    Gunakan kredensial sandbox tiruan untuk menghindari biaya penagihan API yang berlebih.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSandboxMode(!sandboxMode)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  {sandboxMode ? (
                    <ToggleRight className="w-12 h-12 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Option 3: Rate Limiter */}
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800">Batasan Request (API Rate Limit)</h3>
                  <span className="text-xs font-extrabold text-emerald-600">{rateLimit} Req/Menit</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                  <span>Longgar (10)</span>
                  <span>Ketat (200)</span>
                </div>
              </div>

              {/* Option 4: Log Verbosity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Log Verbosity Level</label>
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-55 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="info">INFO - Log Keseluruhan</option>
                    <option value="warn">WARN - Peringatan Saja</option>
                    <option value="error">ERROR - Hanya Error Sistem</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer text-center"
                  >
                    Simpan Pengaturan
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Metrics & Log Terminals */}
        <div className="space-y-6">
          {/* Real-time Health Metrics */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Performa Server LORA</span>
            </h2>

            <div className="space-y-4">
              {/* CPU load */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-slate-400" /> Beban CPU Server
                  </span>
                  <span>{cpuLoad}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      cpuLoad > 80 ? 'bg-rose-500' : cpuLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cpuLoad}%` }}
                  />
                </div>
              </div>

              {/* Memory (RAM) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Database className="w-4 h-4 text-slate-400" /> Konsumsi RAM Server
                  </span>
                  <span>{ramLoad}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Database className="w-4 h-4 text-slate-400" /> Database Connection Pool
                  </span>
                  <span>{dbConn} / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${dbConn}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling System Console Log Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-extrabold uppercase tracking-wider text-[11px]">System Activity Terminal Console</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-900/60">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span>STREAMING ACTIVE</span>
          </span>
        </div>

        <div className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-950 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-850">
          {logs.map((log, idx) => {
            let typeColor = 'text-blue-400';
            let prefix = '[INFO]';
            if (log.type === 'success') {
              typeColor = 'text-emerald-400';
              prefix = '[SUCCESS]';
            } else if (log.type === 'warn') {
              typeColor = 'text-amber-500';
              prefix = '[WARN]';
            } else if (log.type === 'error') {
              typeColor = 'text-rose-500';
              prefix = '[CRITICAL]';
            }

            return (
              <div key={idx} className="flex gap-2 leading-relaxed animate-in slide-in-from-bottom-1 duration-150">
                <span className="text-slate-500 font-semibold flex-shrink-0">[{log.timestamp}]</span>
                <span className={`${typeColor} font-black flex-shrink-0`}>{prefix}</span>
                <span className="text-slate-350">{log.message}</span>
              </div>
            );
          })}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
