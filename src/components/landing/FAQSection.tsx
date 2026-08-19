'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import FadeContent from '@/components/reactbits/FadeContent';

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: 'Apa itu LORA dan siapa saja yang bisa menggunakannya?',
            answer: 'LORA (Local Omni-channel Regional Assistant) adalah platform digital terpadu untuk membantu pelaku usaha memiliki etalase toko online resmi, mengelola stok barang, dan mendapatkan saran bisnis dari Asisten AI. LORA terbuka untuk seluruh sektor UMKM — mulai dari kuliner, batik & fashion, kerajinan tangan, oleh-oleh, makanan olahan, kebutuhan harian, hingga usaha kreatif dan jasa.'
        },
        {
            question: 'Apakah pembeli harus mendaftar akun untuk melihat produk dan berbelanja?',
            answer: 'Tidak wajib. Pengunjung publik dapat langsung melihat-lihat katalog produk unggulan, mencari toko, dan memilih barang belanjaan ke keranjang tanpa harus mendaftar atau login terlebih dahulu.'
        },
        {
            question: 'Bagaimana cara pelaku UMKM membuka toko di LORA?',
            answer: 'Caranya sangat mudah dan gratis! Cukup klik tombol "Daftar", isi nama dan email Anda. Setelah masuk, pilih menu "Buka Toko UMKM" untuk melengkapi nama toko dan lokasi usaha Anda. Dalam hitungan menit, etalase toko digital Anda siap digunakan dan dipromosikan.'
        },
        {
            question: 'Bagaimana cara kerja Asisten AI LORA membantu bisnis saya?',
            answer: 'Asisten AI LORA bertindak seperti konsultan bisnis pribadi yang siap 24 jam. Anda dapat meminta saran ide promosi, rekomendasi paket bundling saat ada event atau liburan daerah, analisis tren penjualan, hingga pengingat waktu terbaik untuk menambah stok produk yang diminati pembeli.'
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 pt-8">
            {/* Section Header with Fade Up */}
            <FadeContent direction="up" distance={20} duration={600} blur>
                <div className="text-center space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-slate-900">
                        Hal yang Sering Ditanyakan
                    </h2>

                    <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                        Temukan jawaban atas pertanyaan mendasar mengenai penggunaan dan manfaat aplikasi LORA untuk usaha Anda.
                    </p>
                </div>
            </FadeContent>

            {/* Accordion List with Staggered Fade Up */}
            <div className="space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <FadeContent
                            key={index}
                            direction="up"
                            distance={20}
                            duration={550}
                            delay={index * 100}
                        >
                            <div
                                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen
                                        ? 'border-terracotta/60 shadow-md shadow-amber-500/5'
                                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-sm sm:text-base font-outfit font-bold text-slate-900 pr-4">
                                        {faq.question}
                                    </span>
                                    <div className={`p-2 rounded-xl transition-all duration-200 ${isOpen ? 'bg-terracotta text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        </FadeContent>
                    );
                })}
            </div>
        </section>
    );
}
