import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Users, Shield, Activity, Database, Sparkles } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // 로그인 체크
    if (!session?.user?.email) {
        redirect('/auth/signin?callbackUrl=/admin');
    }

    // 관리자 권한 체크
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    // 통계 데이터
    const [totalUsers, totalServers, totalResources, totalPosts] = await Promise.all([
        prisma.user.count(),
        prisma.server.count(),
        prisma.resource.count(),
        prisma.post.count(),
    ]);

    // 사용자 목록
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            image: true,
            _count: {
                select: {
                    servers: true,
                    resources: true,
                    posts: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="container max-w-7xl mx-auto py-6 px-4">
                {/* 헤더 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-indigo-600" />
                            <h1 className="text-2xl font-black">관리자 대시보드</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/wiki-generator"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
                            >
                                <Sparkles className="h-4 w-4" />
                                AI 위키 생성기
                            </Link>
                            <Link
                                href="/admin/collections"
                                className="bg-white dark:bg-zinc-800 border hover:bg-slate-50 dark:hover:bg-zinc-700 text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
                            >
                                <Database className="h-4 w-4" />
                                컬렉션 관리
                            </Link>
                            <Link
                                href="/admin/servers"
                                className="bg-white dark:bg-zinc-800 border hover:bg-slate-50 dark:hover:bg-zinc-700 text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
                            >
                                <Shield className="h-4 w-4" />
                                서버 인증 관리
                            </Link>
                            <Link
                                href="/admin/search"
                                className="bg-white dark:bg-zinc-800 border hover:bg-slate-50 dark:hover:bg-zinc-700 text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
                            >
                                <Activity className="h-4 w-4" />
                                검색 가중치 관리
                            </Link>
                        </div>
                    </div>
                    <p className="text-muted-foreground">사용자 권한 및 커뮤니티 관리</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <span className="text-xs font-medium text-muted-foreground">총 사용자</span>
                        </div>
                        <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Database className="h-5 w-5 text-green-500" />
                            <span className="text-xs font-medium text-muted-foreground">등록된 서버</span>
                        </div>
                        <div className="text-2xl font-bold">{totalServers.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            <span className="text-xs font-medium text-muted-foreground">자료실</span>
                        </div>
                        <div className="text-2xl font-bold">{totalResources.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="h-5 w-5 text-orange-500" />
                            <span className="text-xs font-medium text-muted-foreground">게시글</span>
                        </div>
                        <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
                    </div>
                </div>

                {/* 사용자 관리 */}
                <UserManagement users={users} />
            </div>
        </div>
    );
}
