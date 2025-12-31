import { prisma } from '@/lib/prisma';
import ServerList from './ServerList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const servers = await prisma.server.findMany({
        include: {
            _count: {
                select: { votes: true },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="container py-8 bg-slate-50 dark:bg-black/20 min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">마인크래프트 서버 목록</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        다양한 마인크래프트 자바/베드락 서버를 찾아보세요
                    </p>
                </div>
                <Link
                    href="/servers/new"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <Plus className="h-5 w-5" />
                    <span>서버 등록하기</span>
                </Link>
            </div>

            <ServerList initialServers={servers} />
        </div>
    );
}
