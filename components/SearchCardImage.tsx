'use client';

import { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

interface SearchCardImageProps {
    src?: string | null;
    alt: string;
    type: 'SERVER' | 'RESOURCE' | 'WIKI';
    className?: string;
}

export default function SearchCardImage({ src, alt, type, className = '' }: SearchCardImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 ${className}`}>
                {/* Fallback Pattern */}
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                    {type === 'SERVER' ? (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-indigo-500">{alt.slice(0, 1).toUpperCase()}</span>
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-zinc-700 flex items-center justify-center">
                            <ImageOff className="h-6 w-6" />
                        </div>
                    )}
                    <span className="text-xs font-medium">No Image</span>
                </div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover animate-in fade-in duration-300 ${className}`}
            onError={() => setError(true)}
        />
    );
}
