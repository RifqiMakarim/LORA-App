'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
    className?: string;
}

export default function BackButton({ label = 'Kembali', className = '' }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className={`inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-terracotta bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-x-0.5 cursor-pointer ${className}`}
        >
            <ArrowLeft className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );
}
