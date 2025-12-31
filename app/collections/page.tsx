'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layers } from 'lucide-react';

export default function CollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch('/api/collections');
                const data = await res.json();
                setCollections(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    if (loading) {
        return (
            <div className="container py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
                    <Layers className="h-10 w-10 text-indigo-500" />
                    추천 컬렉션
                </h1>
                <p className="text-xl text-muted-foreground">
                    운영진이 엄선한 최고의 자료들을 테마별로 만나보세요.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => (
                    <Link key={collection.id} href={`/collections/${collection.slug}`} className="group">
                        <div className="border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-card hover:-translate-y-1">
                            {/* Thumbnail Area */}
                            <div className="relative h-48 bg-muted overflow-hidden">
                                {collection.thumbnail ? (
                                    <Image
                                        src={collection.thumbnail}
                                        alt={collection.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                        <Layers className="h-16 w-16 text-white/50" />
                                    </div>
                                )}
                                {collection.isOfficial && (
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                                        OFFICIAL
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">
                                    {collection.title}
                                </h2>
                                <p className="text-muted-foreground line-clamp-2 mb-4">
                                    {collection.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                                    <div className="flex items-center gap-2">
                                        {collection.user.image ? (
                                            <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                                <Image src={collection.user.image} alt={collection.user.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-200" />
                                        )}
                                        <span>{collection.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Layers className="w-4 h-4" />
                                        <span>{collection.items.length}개 항목</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {collections.length === 0 && (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
                    <p className="text-muted-foreground">아직 등록된 컬렉션이 없습니다.</p>
                </div>
            )}
        </div>
    );
}
