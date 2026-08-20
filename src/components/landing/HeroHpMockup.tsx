'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroHpMockup() {
    return (
        <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[460px] xl:max-w-[520px] mx-auto flex justify-center items-center translate-x-0 lg:translate-x-4 py-0">
            {/* Ambient Background Glow (Terkontrol di Mobile & Glowing di Desktop) */}
            <div className="absolute inset-0 bg-orange-500/20 blur-[80px] w-full h-full rounded-full z-0 pointer-events-none" />

            {/* Floating Image Mockup HP (Dominan & Menonjol dengan max-h-72vh) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                transition={{
                    opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                    scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                    y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
                }}
                className="relative group transition-all duration-500 w-full flex justify-center z-10"
            >
                <Image
                    src="/images/hape.png"
                    alt="Mockup Aplikasi LORA di Smartphone"
                    width={800}
                    height={1000}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="relative z-10 w-full h-auto max-h-[60vh] sm:max-h-[66vh] lg:max-h-[72vh] xl:max-h-[76vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] sm:drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:scale-102 group-hover:drop-shadow-[0_35px_70px_rgba(217,119,6,0.45)] mx-auto"
                    priority
                />
            </motion.div>
        </div>
    );
}
