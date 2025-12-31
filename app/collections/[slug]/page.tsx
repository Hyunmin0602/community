'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, ArrowRight, Quote } from 'lucide-react';

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`/api/collections/${params.slug}`);
                if (!res.ok) {
                    if (res.status === 404) notFound();
                    throw new Error('Failed');
                }
                const data = await res.json();
                setCollection(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollection();
    }, [params.slug]);

    if (loading) return <div className="py-20 text-center">Loading...</div>;
    if (!collection) return null;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10" />
                {collection.thumbnail && (
                    <Image
                        src={collection.thumbnail}
                        alt={collection.title}
                        fill
                        className="object-cover opacity-30"
                    />
                )}

                <div className="container relative z-20 py-20 max-w-4xl mx-auto text-center">
                    {collection.isOfficial && (
                        <div className="inline-block bg-indigo-500 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide shadow-lg shadow-indigo-500/30">
                            EDITOR&apos;S CHOICE
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        {collection.title}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {collection.description}
                    </p>
                </div>
            </div>

            {/* Items List */}
            <div className="container max-w-4xl mx-auto py-16 -mt-10 relative z-30">
                <div className="space-y-8">
                    {collection.items.map((item: any, index: number) => (
                        <div key={item.id} className="group relative">
                            {/* Connector Line */}
                            {index !== collection.items.length - 1 && (
                                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -mb-8 z-0 hidden md:block" />
                            )}

                            <div className="flex gap-6 relative z-10">
                                {/* Number Badge */}
                                <div className="hidden md:flex h-16 w-16 shrink-0 bg-white dark:bg-zinc-800 rounded-2xl border items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform text-muted-foreground border-border">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Resource Thumbnail */}
                                            <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-muted">
                                                {item.resource.thumbnail ? (
                                                    <Image
                                                        src={item.resource.thumbnail}
                                                        alt={item.resource.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-4xl">📦</div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="mb-auto">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                                            {item.resource.category}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                                                        {item.resource.title}
                                                    </h3>
                                                    {item.note && (
                                                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg text-sm text-foreground/80 italic flex gap-2 mb-4">
                                                            <Quote className="h-4 w-4 shrink-0 text-indigo-400" />
                                                            {item.note}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{item.resource.downloadCount}</span>회 다운로드
                                                    </div>
                                                    <Link
                                                        href={`/resources/${item.resource.id}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                                    >
                                                        보러가기
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
