'use client';

import Link from 'next/link';
import { SearchContent } from '@prisma/client';
import SearchCardImage from '@/components/SearchCardImage';
import { useSearchLogger } from '@/lib/hooks/useSearchLogger';

export default function ResourceResultList({ items }: { items: SearchContent[] }) {
    const { logInteraction } = useSearchLogger();
    if (items.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((item) => (
                <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => logInteraction(item.id, 'CLICK')}
                    data-search-content-id={item.id}
                    className="block bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border hover:border-indigo-500 transition-all hover:shadow-sm relative group"
                >
                    {(item.trustGrade === 'S' || item.relevanceGrade === 'S') && (
                        <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 font-bold rounded-br-md z-10">
                            REC
                        </div>
                    )}
                    <div className="aspect-video relative bg-slate-100 dark:bg-zinc-800">
                        <SearchCardImage src={item.thumbnail} alt={item.title} type={item.type as any} />
                    </div>
                    <div className="p-2.5">
                        <h3 className="font-bold text-sm truncate mb-1">{item.title}</h3>
                        <div className="flex gap-1 mt-1.5 overflow-hidden">
                            {item.tags.slice(0, 2).map(t => <span key={t} className="text-[9px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-slate-500 whitespace-nowrap">#{t}</span>)}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{item.type}</span>
                            <div className="flex gap-0.5">
                                <span title="신뢰도">{item.trustGrade}</span>
                                <span>·</span>
                                <span title="정확도">{item.accuracyGrade}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
