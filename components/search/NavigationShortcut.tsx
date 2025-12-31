import Link from 'next/link';
import { Server, BookOpen, ExternalLink } from 'lucide-react';
import { SearchContent } from '@prisma/client';

export default function NavigationShortcut({ target }: { target: SearchContent }) {
    if (!target) return null;

    return (
        <section>
            <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">바로가기 (Top Pick)</h2>
            <div className="group relative overflow-hidden rounded-xl border border-indigo-500/50 hover:border-indigo-500 transition-all hover:shadow-lg bg-white dark:bg-zinc-900">
                <div className="p-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-zinc-800 rounded-full shadow-sm shrink-0">
                            {target.type === 'SERVER' ? <Server className="h-8 w-8 text-indigo-500" /> : <BookOpen className="h-8 w-8 text-indigo-500" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {target.title}
                                </h3>
                                {target.trustGrade === 'S' && (
                                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">OFFICIAL</span>
                                )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 line-clamp-1">
                                {target.description}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={target.link}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm shrink-0"
                    >
                        바로가기 <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
