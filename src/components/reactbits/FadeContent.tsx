'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface FadeContentProps {
    children: ReactNode;
    blur?: boolean;
    duration?: number; // in milliseconds
    delay?: number; // in milliseconds
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number; // in pixels
    threshold?: number;
    className?: string;
    once?: boolean;
}

export default function FadeContent({
    children,
    blur = false,
    duration = 1000,
    delay = 0,
    direction = 'up',
    distance = 28,
    threshold = 0.1,
    className = '',
    once = true,
}: FadeContentProps) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!once) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, once]);

    const getTransform = (): string => {
        if (isVisible) return 'translate3d(0, 0, 0)';
        switch (direction) {
            case 'up':
                return `translate3d(0, ${distance}px, 0)`;
            case 'down':
                return `translate3d(0, -${distance}px, 0)`;
            case 'left':
                return `translate3d(${distance}px, 0, 0)`;
            case 'right':
                return `translate3d(-${distance}px, 0, 0)`;
            case 'none':
            default:
                return 'translate3d(0, 0, 0)';
        }
    };

    return (
        <div
            ref={elementRef}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                filter: blur ? (isVisible ? 'blur(0px)' : 'blur(10px)') : 'none',
                transitionProperty: 'opacity, transform, filter',
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
