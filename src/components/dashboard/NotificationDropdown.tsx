'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  ShoppingBag,
  Calendar,
  CheckCheck,
  RefreshCw,
  ChevronRight,
  Package,
  X,
  Sparkles
} from 'lucide-react';
import type { NotificationItem } from '@/app/api/seller/notifications/route';

interface NotificationDropdownProps {
  isAdminRoute?: boolean;
}

export default function NotificationDropdown({ isAdminRoute }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'inventory' | 'orders' | 'events'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read status from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lora_read_notifications');
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Failed to parse read notifications from localStorage', e);
    }
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/notifications?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.notifications) {
          setNotifications(json.notifications);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling setiap 45 detik agar alert selalu terkini jika ada pesanan atau stok berkurang
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem('lora_read_notifications', JSON.stringify(Array.from(allIds)));
    } catch (e) {
      console.warn('Failed to save read notifications', e);
    }
  };

  // Mark single as read
  const handleMarkSingleAsRead = (id: string) => {
    setReadIds((prev) => {
      const updated = new Set(prev).add(id);
      try {
        localStorage.setItem('lora_read_notifications', JSON.stringify(Array.from(updated)));
      } catch (e) {
        console.warn('Failed to save read notification', e);
      }
      return updated;
    });
  };

  // Filtered Notifications by tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const inventoryUnread = notifications.filter((n) => n.category === 'inventory' && !readIds.has(n.id)).length;
  const ordersUnread = notifications.filter((n) => n.category === 'orders' && !readIds.has(n.id)).length;
  const eventsUnread = notifications.filter((n) => n.category === 'events' && !readIds.has(n.id)).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Notification Bell */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-amber-500/10 border-amber-400 text-terracotta shadow-xs'
            : 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-700 hover:text-slate-900'
        }`}
        aria-label="Buka Pemberitahuan Toko"
        title="Pemberitahuan Toko"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

        {/* Badge Unread Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[1.125rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-terracotta rounded-xl border border-amber-200/60">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-outfit font-extrabold text-slate-900 leading-tight">
                  Pemberitahuan
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {unreadCount > 0 ? `${unreadCount} pemberitahuan butuh perhatian` : 'Semua terpantau aman'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                title="Muat Ulang"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-terracotta' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                title="Tandai Semua Dibaca"
              >
                <CheckCheck className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Semua ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-[11px] flex items-center gap-1 ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Stok &amp; ROP</span>
              {inventoryUnread > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-[11px] flex items-center gap-1 ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Pesanan</span>
              {ordersUnread > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-[11px] flex items-center gap-1 ${
                activeTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Event</span>
              {eventsUnread > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          {/* Notification List Container */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <Package className="w-6 h-6 stroke-1.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Tidak Ada Alert Aktif</h4>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                  Semua stok produk berada di batas aman dan pesanan toko berjalan lancar.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = readIds.has(notif.id);

                // Icon & Styling berdasarkan kategori
                let IconComponent = AlertTriangle;
                let iconBg = 'bg-amber-50 text-amber-600 border-amber-200';

                if (notif.type === 'inventory_out') {
                  IconComponent = TrendingDown;
                  iconBg = 'bg-rose-50 text-rose-600 border-rose-200';
                } else if (notif.category === 'orders') {
                  IconComponent = ShoppingBag;
                  iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                } else if (notif.category === 'events') {
                  IconComponent = Calendar;
                  iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-200';
                }

                return (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => {
                      handleMarkSingleAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3.5 sm:p-4 hover:bg-slate-50 transition-colors group relative ${
                      !isRead ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${!isRead ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                            {notif.title}
                          </h4>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                            {notif.category === 'inventory' ? 'Inventaris' : notif.category === 'orders' ? 'Pesanan' : 'Event Daerah'}
                          </span>

                          <span className="text-[10px] font-bold text-terracotta group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            <span>Buka</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Panel */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link
              href="/dashboard/inventory"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-slate-900 font-bold hover:underline"
            >
              Lihat Semua Stok ROP
            </Link>

            <Link
              href="/dashboard/pesanan"
              onClick={() => setIsOpen(false)}
              className="text-terracotta hover:text-amber-800 font-bold hover:underline"
            >
              Kelola Pesanan →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
