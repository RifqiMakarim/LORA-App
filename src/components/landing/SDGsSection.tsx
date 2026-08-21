'use client';

import Image from 'next/image';
import FadeContent from '@/components/reactbits/FadeContent';

export default function SDGsSection() {
    const sdgs = [
        {
            number: '08',
            title: 'Pekerjaan Layak & Pertumbuhan Ekonomi',
            imageSrc: '/images/SDGs-logo/SDGs8.jpg',
            description: 'Mendorong kemandirian ekonomi UMKM lokal melalui etalase digital terpadu dan perluasan akses pasar di DIY & Jateng.',
            badgeColor: 'bg-[#A21942] text-white',
            borderColor: 'hover:border-[#A21942]/60'
        },
        {
            number: '09',
            title: 'Industri, Inovasi, & Infrastruktur',
            imageSrc: '/images/SDGs-logo/SDGs9.png',
            description: 'Menghadirkan inovasi kecerdasan buatan (AI) dan analitik bisnis yang mudah digunakan oleh seluruh pelaku usaha mikro.',
            badgeColor: 'bg-[#F26A2E] text-white',
            borderColor: 'hover:border-[#F26A2E]/60'
        },
        {
            number: '10',
            title: 'Berkurangnya Kesenjangan',
            imageSrc: '/images/SDGs-logo/SDGs10.jpg',
            description: 'Membuka akses teknologi dan analitik pasar yang setara bagi pengrajin desa agar mampu bersaing dengan industri modern.',
            badgeColor: 'bg-[#E01A83] text-white',
            borderColor: 'hover:border-[#E01A83]/60'
        },
        {
            number: '12',
            title: 'Konsumsi & Produksi Bertanggung Jawab',
            imageSrc: '/images/SDGs-logo/SDGs12.png',
            description: 'Mencegah pemborosan bahan baku dan penumpukan barang melalui sistem pengingat stok dan estimasi persediaan yang akurat.',
            badgeColor: 'bg-[#BF8B2E] text-white',
            borderColor: 'hover:border-[#BF8B2E]/60'
        }
    ];

    return (
        <section id="sdgs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pt-8">
            {/* Section Header with Fade Up */}
            <FadeContent direction="up" distance={20} duration={600} blur>
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-outfit font-black tracking-tight text-slate-900">
                        Dukungan Nyata untuk Tujuan Pembangunan Berkelanjutan (SDGs)
                    </h2>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                        Mendorong pertumbuhan ekonomi inklusif, inovasi teknologi terjangkau, dan pengelolaan usaha yang bertanggung jawab.
                    </p>
                </div>
            </FadeContent>

            {/* Grid 4 Kotak Simpel dengan Staggered Fade Up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {sdgs.map((item, idx) => {
                    return (
                        <FadeContent
                            key={idx}
                            direction="up"
                            distance={24}
                            duration={600}
                            delay={idx * 120}
                        >
                            <div className={`bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 ${item.borderColor} shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start gap-5 group h-full`}>
                                {/* Gambar Logo SDG */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                                    <Image
                                        src={item.imageSrc}
                                        alt={`Logo SDG ${item.number} - ${item.title}`}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Konten Teks Ringkas */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black font-outfit ${item.badgeColor}`}>
                                            SDG {item.number}
                                        </span>
                                    </div>

                                    <h3 className="text-sm sm:text-base font-outfit font-bold text-slate-900 group-hover:text-slate-800">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </FadeContent>
                    );
                })}
            </div>
        </section>
    );
}
