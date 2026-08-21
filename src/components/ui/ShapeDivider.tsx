import React from 'react';

export type ShapeDividerVariant = 'wave' | 'smooth-wave' | 'rising-wave' | 'curve' | 'slant';
export type ShapeDividerDirection = 'inward' | 'outward';

export interface ShapeDividerProps {
    variant?: ShapeDividerVariant;
    position?: 'top' | 'bottom';
    direction?: ShapeDividerDirection; // 'outward' (keluar/cembung ke section berikutnya) atau 'inward' (kedalam)
    color?: string; // Tailwind text color class, e.g., 'text-[#0B1120]', 'text-slate-50', 'text-amber-500/10'
    height?: string; // Tailwind height class, e.g., 'h-8 sm:h-14 md:h-20'
    flip?: boolean; // Flip horizontally
    className?: string;
}

/**
 * ShapeDivider - Komponen Kustom SVG Wave & Curve Divider
 * Menggunakan path GetWaves organik presisi tinggi untuk transisi antar section.
 */
export default function ShapeDivider({
    variant = 'wave',
    position = 'bottom',
    direction = 'outward',
    color = 'text-[#0B1120]',
    height = 'h-8 sm:h-12 md:h-16 lg:h-20',
    flip = false,
    className = '',
}: ShapeDividerProps) {
    const isTop = position === 'top';
    const isOutward = direction === 'outward';

    const getViewBox = () => {
        if (variant === 'rising-wave' || variant === 'wave') return '0 0 1440 320';
        return '0 0 1440 120';
    };

    const getPath = () => {
        if (variant === 'rising-wave') {
            // Versi Rising Wave: Arah gelombang naik dari bawah (Section 6 Fitur Utama) ke atas (Solusi-Fitur)
            return (
                <path
                    d="M0,256 L40,261.3 C80,267,160,277,240,234.7 C320,192,400,96,480,80 C560,64,640,128,720,176 C800,224,880,256,960,272 C1040,288,1120,288,1200,261.3 C1280,235,1360,181,1400,154.7 L1440,128 L1440,320 L0,320 Z"
                    className="fill-current"
                    stroke="none"
                />
            );
        }

        if (isOutward) {
            // OUTWARD (Arah Keluar): Bagian atas terisi penuh dan melengkung/bergelombang keluar ke bawah
            switch (variant) {
                case 'smooth-wave':
                    return (
                        <path
                            d="M0,0 L1440,0 L1440,35 C1320,65 1200,85 1080,75 C960,65 840,30 720,40 C600,50 480,85 360,75 C240,65 120,35 0,45 Z"
                            className="fill-current"
                            stroke="none"
                        />
                    );
                case 'curve':
                    return (
                        <path
                            d="M0,0 L1440,0 L1440,20 C960,120 480,120 0,20 Z"
                            className="fill-current"
                            stroke="none"
                        />
                    );
                case 'slant':
                    return (
                        <path
                            d="M0,0 L1440,0 L1440,100 L0,0 Z"
                            className="fill-current"
                            stroke="none"
                        />
                    );
                case 'wave':
                default:
                    // Versi GetWaves Triple Dip Organik (Hero -> Solusi-Fitur Outward Flow)
                    return (
                        <path
                            d="M0,0 L1440,0 L1440,160 L1400,133.3 C1360,107,1280,53,1200,64 C1120,75,1040,149,960,149.3 C880,149,800,75,720,85.3 C640,96,560,192,480,208 C400,224,320,160,240,117.3 C160,75,80,53,40,42.7 L0,32 Z"
                            className="fill-current"
                            stroke="none"
                        />
                    );
            }
        }

        // INWARD (Arah Kedalam): Bagian bawah terisi penuh dan memotong ke atas
        switch (variant) {
            case 'smooth-wave':
                return (
                    <path
                        d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
                        className="fill-current"
                        stroke="none"
                    />
                );
            case 'curve':
                return (
                    <path
                        d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z"
                        className="fill-current"
                        stroke="none"
                    />
                );
            case 'slant':
                return (
                    <path
                        d="M0,120 L1440,0 L1440,120 L0,120 Z"
                        className="fill-current"
                        stroke="none"
                    />
                );
            case 'wave':
            default:
                // Versi GetWaves Triple Dip Organik (Inward)
                return (
                    <path
                        d="M0,32 L40,42.7 C80,53,160,75,240,117.3 C320,160,400,224,480,208 C560,192,640,96,720,85.3 C800,75,880,149,960,149.3 C1040,149,1120,75,1200,64 C1280,53,1360,107,1400,133.3 L1440,160 L1440,320 L0,320 Z"
                        className="fill-current"
                        stroke="none"
                    />
                );
        }
    };

    return (
        <div
            className={`w-full overflow-hidden leading-none pointer-events-none ${height} ${color} ${
                isTop ? 'rotate-180' : ''
            } ${flip ? 'scale-x-[-1]' : ''} ${className}`}
            aria-hidden="true"
        >
            <svg
                viewBox={getViewBox()}
                preserveAspectRatio="none"
                className="relative block w-full h-full border-none outline-none"
                style={{ stroke: 'none' }}
            >
                {getPath()}
            </svg>
        </div>
    );
}
