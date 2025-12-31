'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Download, Heart, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';

interface SubCategory {
    value: string;
    label: string;
}

interface ResourceListProps {
    category: string;
    subCategories: SubCategory[];
    title: string;
}

export default function ResourceList({ category, subCategories, title }: ResourceListProps) {
    const [resources, setResources] = useState<any[]>([]);
    const [subCategory, setSubCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('category', category);
            if (subCategory !== 'ALL') params.set('subCategory', subCategory);

            const res = await fetch(`/api/resources?${params}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setResources(data);
            } else {
                setResources([]);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, [category, subCategory]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black mb-2">{title}</h1>
                <p className="text-muted-foreground">다양한 {title.toLowerCase()}을(를) 찾아보세요</p>
            </div>

            {/* Sub-category tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                <button
                    onClick={() => setSubCategory('ALL')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${subCategory === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                >
                    전체
                </button>
                {subCategories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSubCategory(cat.value)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${subCategory === cat.value
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Resources grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">로딩 중...</p>
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-lg text-muted-foreground">등록된 자료가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map((resource) => (
                        <Link key={resource.id} href={`/resources/${resource.id}`} className="group">
                            <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-slate-100 dark:bg-zinc-800">
                                    {resource.thumbnail ? (
                                        <Image
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate-300">
                                            📦
                                        </div>
                                    )}
                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {resource.isEditorsChoice && (
                                            <div className="bg-yellow-500/90 text-white p-1.5 rounded-full shadow-lg backdrop-blur-sm" title="에디터 추천">
                                                <Star className="h-3 w-3 fill-current" />
                                            </div>
                                        )}
                                        {resource.isVerified && (
                                            <div className="bg-blue-500/90 text-white p-1.5 rounded-full shadow-lg backdrop-blur-sm" title="구동 확인됨">
                                                <ShieldCheck className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>

                                    {resource.subCategory && (
                                        <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-sm">
                                            {subCategories.find(c => c.value === resource.subCategory)?.label || resource.subCategory}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {resource.description || '설명이 없습니다.'}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Download className="h-4 w-4" />
                                            <span>{resource.downloadCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            <span>{resource._count?.likes || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
