'use client';

import Link from 'next/link';
import { SearchContent } from '@prisma/client';
import SearchCardImage from '@/components/SearchCardImage';
import { useSearchLogger } from '@/lib/hooks/useSearchLogger';

export default function ServerResultList({ items }: { items: SearchContent[] }) {
    const { logInteraction } = useSearchLogger();
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => logInteraction(item.id, 'CLICK')}
                    data-search-content-id={item.id}
                    className="relative block h-24 sm:h-28 rounded-xl overflow-hidden group"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <SearchCardImage src={item.thumbnail} alt={item.title} type={item.type as any} className="opacity-50 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </div>

                    {(item.trustGrade === 'S' || item.relevanceGrade === 'S') && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 font-bold rounded-bl-md z-20">
                            REC
                        </div>
                    )}

                    {/* Content Layer */}
                    <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                        <h3 className="font-bold text-white text-base sm:text-lg truncate pr-8 mb-1 drop-shadow-md">{item.title}</h3>
                        <p className="text-xs text-slate-200 line-clamp-1 mb-2 max-w-[80%] drop-shadow-sm opacity-90">{item.description}</p>

                        <div className="flex items-center gap-2 mt-auto">
                            <div className="flex gap-1 overflow-hidden">
                                {item.tags.slice(0, 3).map(t => (
                                    <span key={t} className="text-[9px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-white whitespace-nowrap border border-white/10">
                                        #{t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-1.5 text-[10px] text-slate-300 items-center ml-2 border-l border-white/20 pl-2">
                                <span className={item.trustGrade === 'S' ? 'font-bold text-indigo-300' : ''}>
                                    신뢰 {item.trustGrade}
                                </span>
                                <span>·</span>
                                <span>정확 {item.accuracyGrade}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
