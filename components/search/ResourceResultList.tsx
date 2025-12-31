import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SearchContent } from '@prisma/client';
import SearchCardImage from '@/components/SearchCardImage';

export default function ResourceResultList({ items }: { items: SearchContent[] }) {
    if (items.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-bold">📚 추천 콘텐츠</h2>
                </div>
                <span className="text-xs text-muted-foreground">3대 지표(신뢰/정확/관련)순 정렬</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                    <Link key={item.id} href={item.link} className="block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border hover:border-indigo-500 transition-all hover:shadow-lg relative group">
                        {(item.trustGrade === 'S' || item.relevanceGrade === 'S') && (
                            <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] px-2 py-1 font-bold rounded-br-lg z-10">
                                RECOMMENDED
                            </div>
                        )}
                        <div className="aspect-video relative bg-slate-100 dark:bg-zinc-800">
                            <SearchCardImage src={item.thumbnail} alt={item.title} type={item.type as any} />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold truncate mb-1">{item.title}</h3>
                            <div className="flex gap-1 mt-2">
                                {item.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">#{t}</span>)}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>{item.type}</span>
                                <div className="flex gap-1">
                                    <span title="신뢰도">{item.trustGrade}</span>
                                    <span title="정확도">{item.accuracyGrade}</span>
                                    <span title="관련도">{item.relevanceGrade}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
