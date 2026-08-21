'use client';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number; // in seconds
    className?: string;
}

export default function ShinyText({
    text,
    disabled = false,
    speed = 4,
    className = '',
}: ShinyTextProps) {
    if (disabled) {
        return <span className={className}>{text}</span>;
    }

    return (
        <span
            className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-100 to-amber-400 bg-[length:200%_auto] animate-shimmer ${className}`}
            style={{
                animationDuration: `${speed}s`,
            }}
        >
            {text}
        </span>
    );
}
