'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Loader2, X } from 'lucide-react';

export interface ComboboxOption {
    id: string;
    name: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: ComboboxOption | null;
    onChange: (option: ComboboxOption | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    loading?: boolean;
    label?: string;
}

export default function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...',
    disabled = false,
    loading = false,
    label,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter opsi pilihan berdasarkan query pencarian (case-insensitive)
    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    // Menutup dropdown saat mengeklik di luar area komponen (click-outside)
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: ComboboxOption) => {
        onChange(option);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearch('');
    };

    return (
        <div ref={wrapperRef} className="space-y-1 w-full relative">
            {label && (
                <label className="block text-xs font-semibold text-slate-700">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <div
                onClick={() => {
                    if (!disabled && !loading) setIsOpen(!isOpen);
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    disabled || loading
                        ? 'opacity-60 bg-slate-100 cursor-not-allowed border-slate-200'
                        : isOpen
                        ? 'border-terracotta ring-2 ring-terracotta/20 bg-white'
                        : 'border-slate-300 hover:bg-white text-slate-900'
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta flex-shrink-0" />
                    ) : null}
                    <span className={`truncate font-medium ${value ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        {loading ? 'Memuat data...' : value ? value.name : placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {value && !disabled && !loading && (
                        <span
                            onClick={handleClear}
                            className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200"
                        >
                            <X className="w-3 h-3" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-terracotta' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu Popover dengan Input Pencarian */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    {/* Input Filter Pencarian */}
                    <div className="relative sticky top-0 bg-white pb-1.5 pt-0.5 z-10 border-b border-slate-100">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                            autoFocus
                        />
                    </div>

                    {/* List Opsi Pilihan */}
                    <div className="space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-3">
                                Tidak ada data ditemukan
                            </p>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = value?.id === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-terracotta text-white font-bold'
                                                : 'text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="truncate">{opt.name}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
