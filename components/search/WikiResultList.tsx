'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SearchContent } from '@prisma/client';
import { useSearchLogger } from '@/lib/hooks/useSearchLogger';

export default function WikiResultList({ wikis }: { wikis: SearchContent[] }) {
    const { logInteraction } = useSearchLogger();
    if (wikis.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-bold">🔔 관련 가이드 & 정보</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wikis.map((wiki) => (
                    <Link
                        key={wiki.id}
                        href={wiki.link}
                        onClick={() => logInteraction(wiki.id, 'CLICK')}
                        data-search-content-id={wiki.id}
                        className="block group relative p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                    >
                        {/* Decorative Background Icon */}
                        <BookOpen className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 dark:text-zinc-800/50 group-hover:text-green-50 dark:group-hover:text-green-900/10 transition-colors z-0" />

                        <div className="relative z-10">
                            <div className="flex gap-2 mb-3">
                                {wiki.trustGrade === 'S' && <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-bold border border-green-200 dark:border-green-800">공식 가이드</span>}
                                {wiki.accuracyGrade === 'S' && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-bold border border-blue-200 dark:border-blue-800">정확도 높음</span>}
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">{wiki.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{wiki.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
