'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  scrollAnchor?: string;
  itemLabel?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  scrollAnchor,
  itemLabel = 'data',
  className = '',
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Helper membuat URL paginasi mempertahankan seluruh query parameters aktif
  const getPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('page', String(pageNumber));
    const hash = scrollAnchor ? (scrollAnchor.startsWith('#') ? scrollAnchor : `#${scrollAnchor}`) : '';
    return `${pathname || ''}?${params.toString()}${hash}`;
  };

  const handlePageClick = (page: number, e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  // Info teks ringkasan
  let summaryText = '';
  if (totalItems !== undefined && itemsPerPage !== undefined) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    summaryText = `Menampilkan ${startItem}–${endItem} dari ${totalItems} ${itemLabel}`;
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;
  const isUrlMode = !onPageChange;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {/* Ringkasan Jumlah Data */}
      {summaryText && (
        <p className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
          {summaryText}
        </p>
      )}

      {/* Kontrol Navigasi Paginasi */}
      <nav
        aria-label="Paginasi Navigasi"
        className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center"
      >
        {/* Tombol Sebelumnya */}
        {isUrlMode ? (
          <Link
            href={!isPrevDisabled ? getPageURL(currentPage - 1) : '#'}
            aria-disabled={isPrevDisabled}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isPrevDisabled
                ? 'opacity-40 pointer-events-none text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled={isPrevDisabled}
            onClick={(e) => handlePageClick(currentPage - 1, e)}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isPrevDisabled
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
        )}

        {/* Nomor-Nomor Halaman */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            if (isUrlMode) {
              return (
                <Link
                  key={`page-${pageNum}`}
                  href={getPageURL(pageNum)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-terracotta text-white shadow-sm shadow-terracotta/30 border border-terracotta font-extrabold scale-105'
                      : 'text-slate-700 bg-white hover:bg-orange-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            }

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={(e) => handlePageClick(pageNum, e)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-terracotta text-white shadow-sm shadow-terracotta/30 border border-terracotta font-extrabold scale-105'
                    : 'text-slate-700 bg-white hover:bg-orange-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Tombol Berikutnya */}
        {isUrlMode ? (
          <Link
            href={!isNextDisabled ? getPageURL(currentPage + 1) : '#'}
            aria-disabled={isNextDisabled}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isNextDisabled
                ? 'opacity-40 pointer-events-none text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled={isNextDisabled}
            onClick={(e) => handlePageClick(currentPage + 1, e)}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isNextDisabled
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-terracotta border border-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </nav>
    </div>
  );
}
