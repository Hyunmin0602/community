import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Shield } from 'lucide-react';
import ServerManagement from '@/components/admin/ServerManagement';

export const dynamic = 'force-dynamic';

export default async function AdminServersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const servers = await prisma.server.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-3xl font-black">서버 인증 관리</h1>
                    </div>
                    <p className="text-muted-foreground">서버 공식 인증 및 추천 상태를 관리합니다.</p>
                </div>

                <ServerManagement servers={servers as any} />
            </div>
        </div>
    );
}
