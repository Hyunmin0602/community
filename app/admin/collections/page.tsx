import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Plus, Edit, ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/signin?callbackUrl=/admin/collections');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const collections = await prisma.collection.findMany({
        include: {
            user: true,
            _count: {
                select: { items: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            관리자 홈으로 돌아가기
                        </Link>
                        <h1 className="text-3xl font-black">컬렉션 관리</h1>
                        <p className="text-muted-foreground">큐레이션 컬렉션을 생성하고 관리합니다.</p>
                    </div>
                    <Link
                        href="/admin/collections/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        새 컬렉션 만들기
                    </Link>
                </div>

                <div className="grid gap-4">
                    {collections.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border">
                            <p className="text-muted-foreground mb-4">생성된 컬렉션이 없습니다.</p>
                        </div>
                    ) : (
                        collections.map((collection) => (
                            <div key={collection.id} className="bg-white dark:bg-zinc-900 border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative w-full md:w-64 aspect-video bg-muted rounded-lg overflow-hidden shrink-0">
                                    {collection.thumbnail ? (
                                        <Image
                                            src={collection.thumbnail}
                                            alt={collection.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <h3 className="font-bold text-xl">{collection.title}</h3>
                                        {collection.isOfficial && (
                                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-bold">
                                                Official
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mb-4 line-clamp-2">{collection.description}</p>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                        <span>/{collection.slug}</span>
                                        <span>아이템 {collection._count.items}개</span>
                                        <span>조회 {collection.views}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Link
                                        href={`/collections/${collection.slug}`}
                                        target="_blank"
                                        className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        보기
                                    </Link>
                                    <Link
                                        href={`/admin/collections/${collection.id}`}
                                        className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        관리
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
