'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import FilterSidebar from '@/components/resources/FilterSidebar';

const CATEGORIES = [
    { value: 'ALL', label: '전체' },
    { value: 'MAP', label: '맵' },
    { value: 'PLUGIN', label: '플러그인' },
    { value: 'MOD', label: '모드' },
    { value: 'SKIN', label: '스킨' },
    { value: 'ADDON', label: '애드온' },
    { value: 'SEED', label: '시드' },
    { value: 'SERVERPACK', label: '서버팩' },
    { value: 'TEXTURE', label: '텍스처팩' },
    { value: 'DATAPACK', label: '데이터팩' },
];

import { Suspense } from 'react';

function ResourcesContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'ALL';

    const [resources, setResources] = useState<any[]>([]);
    const [category, setCategory] = useState(initialCategory);
    const [loading, setLoading] = useState(true);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== 'ALL') params.set('category', category);

            const res = await fetch(`/api/resources?${params}`);
            const data = await res.json();

            // 배열인지 확인
            if (Array.isArray(data)) {
                setResources(data);
            } else {
                console.error('Invalid response format:', data);
                setResources([]);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    return (
        <div className="container py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">자료실</h1>
                    <Link href="/resources/new" className="btn-primary flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>자료 등록</span>
                    </Link>
                </div>

                {/* 카테고리 탭 */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${category === cat.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 사이드바 필터 */}
                    <div className="hidden lg:block lg:col-span-1">
                        <FilterSidebar />
                    </div>

                    {/* 자료 그리드 */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">로딩 중...</p>
                            </div>
                        ) : resources.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">등록된 자료가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.map((resource) => (
                                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                                        <div className="card p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                                            {resource.thumbnail && (
                                                <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
                                                    <Image
                                                        src={resource.thumbnail}
                                                        alt={resource.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <h3 className="font-bold mb-2 line-clamp-2">{resource.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {resource.description}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    다운로드 {resource.downloadCount}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    좋아요 {resource._count?.likes || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResourcesPage() {
    return (
        <Suspense fallback={<div className="container py-8 text-center">Loading...</div>}>
            <ResourcesContent />
        </Suspense>
    );
}
