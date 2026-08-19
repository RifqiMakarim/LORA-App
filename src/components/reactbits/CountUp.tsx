'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    to: number;
    from?: number;
    duration?: number; // in seconds
    separator?: string;
    prefix?: string;
    suffix?: string;
    className?: string;
    startWhenInView?: boolean;
}

export default function CountUp({
    to,
    from = 0,
    duration = 3,
    separator = '.',
    prefix = '',
    suffix = '',
    className = '',
    startWhenInView = true,
}: CountUpProps) {
    const [count, setCount] = useState<number>(from);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef<boolean>(false);

    const formatNumber = (num: number): string => {
        const rounded = Math.round(num);
        return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    };

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Smooth cubic-bezier ease-out curve
        const easeOutCubic = (t: number): number => {
            return 1 - Math.pow(1 - t, 3);
        };

        const startAnimation = () => {
            if (hasAnimated.current) return;
            hasAnimated.current = true;

            const startTime = performance.now();
            const durationMs = duration * 1000;

            const updateCount = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const easedProgress = easeOutCubic(progress);
                const currentVal = from + (to - from) * easedProgress;

                setCount(currentVal);

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    setCount(to);
                }
            };

            requestAnimationFrame(updateCount);
        };

        if (startWhenInView && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            startAnimation();
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(element);

            return () => {
                observer.disconnect();
            };
        } else {
            startAnimation();
        }
    }, [to, from, duration, startWhenInView]);

    return (
        <span ref={elementRef} className={className}>
            {prefix}
            {formatNumber(count)}
            {suffix}
        </span>
    );
}
