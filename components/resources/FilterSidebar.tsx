'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Star, Filter } from 'lucide-react';

interface FilterSidebarProps {
    className?: string;
}

export default function FilterSidebar({ className }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [verified, setVerified] = useState(searchParams.get('verified') === 'true');
    const [minRating, setMinRating] = useState(Number(searchParams.get('minRating')) || 0);
    const [version, setVersion] = useState(searchParams.get('version') || '');

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (verified) params.set('verified', 'true');
        else params.delete('verified');

        if (minRating > 0) params.set('minRating', minRating.toString());
        else params.delete('minRating');

        if (version) params.set('version', version);
        else params.delete('version');

        router.push(`/resources?${params.toString()}`);
    };

    const resetFilters = () => {
        setVerified(false);
        setMinRating(0);
        setVersion('');
        router.push('/resources');
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    필터
                </h3>
                <button
                    onClick={resetFilters}
                    className="text-xs text-muted-foreground hover:text-indigo-600 underline"
                >
                    초기화
                </button>
            </div>

            {/* Verified Filter */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${verified ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 border-gray-300'}`}>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={verified}
                            onChange={(e) => setVerified(e.target.checked)}
                        />
                        {verified && <ShieldCheck className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        인증된 자료만 보기
                    </span>
                </label>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
                <label className="text-sm font-semibold">최소 평점</label>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="rating"
                                checked={minRating === rating}
                                onChange={() => setMinRating(rating)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                                <span className="ml-2 text-xs text-muted-foreground">{rating}점 이상</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Version Filter (Simple Input for now) */}
            <div className="space-y-3">
                <label className="text-sm font-semibold">게임 버전</label>
                <input
                    type="text"
                    placeholder="예: 1.20.1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-background focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Apply Button */}
            <button
                onClick={applyFilters}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
                필터 적용하기
            </button>
        </div>
    );
}
