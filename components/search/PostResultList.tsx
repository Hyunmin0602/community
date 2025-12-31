import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { SearchContent } from '@prisma/client';

export default function PostResultList({ posts }: { posts: SearchContent[] }) {
    if (posts.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <MessageSquare className="h-5 w-5 text-slate-500" />
                <h2 className="text-xl font-bold text-slate-700">📝 관련 게시글</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {posts.map((post) => (
                    <Link key={post.id} href={post.link} className="flex items-start md:items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors mb-1">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{post.description}</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 shrink-0 ml-4">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> 조회 {post.viewCount}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
