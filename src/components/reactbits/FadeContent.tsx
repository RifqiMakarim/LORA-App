'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FadeContentProps {
    children: ReactNode;
    blur?: boolean;
    duration?: number; // in milliseconds or seconds
    delay?: number; // in milliseconds
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number; // in pixels
    threshold?: number;
    className?: string;
    once?: boolean;
    scale?: boolean;
    scaleVal?: number;
}

export default function FadeContent({
    children,
    blur = false,
    duration = 700,
    delay = 0,
    direction = 'up',
    distance = 30,
    threshold = 0.15,
    className = '',
    once = true,
    scale = false,
    scaleVal = 0.95,
}: FadeContentProps) {
    const getInitialOffset = () => {
        switch (direction) {
            case 'up':
                return { y: distance, x: 0 };
            case 'down':
                return { y: -distance, x: 0 };
            case 'left':
                return { y: 0, x: distance };
            case 'right':
                return { y: 0, x: -distance };
            case 'none':
            default:
                return { y: 0, x: 0 };
        }
    };

    const offset = getInitialOffset();

    const durationSec = duration > 10 ? duration / 1000 : duration;
    const delaySec = delay > 10 ? delay / 1000 : delay;

    return (
        <motion.div
            className={className}
            initial={{
                opacity: 0,
                x: offset.x,
                y: offset.y,
                scale: scale ? scaleVal : 1,
                filter: blur ? 'blur(8px)' : 'none',
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: blur ? 'blur(0px)' : 'none',
            }}
            viewport={{ once, amount: threshold }}
            transition={{
                duration: durationSec,
                delay: delaySec,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
