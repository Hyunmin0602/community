import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect('/');
    }

    const [serverCount, postCount, resourceCount] = await Promise.all([
        prisma.server.count({ where: { userId: user.id } }),
        prisma.post.count({ where: { userId: user.id } }),
        prisma.resource.count({ where: { userId: user.id } }),
    ]);

    const recentServers = await prisma.server.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const recentPosts = await prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const recentResources = await prisma.resource.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return (
        <ProfileClient
            user={user}
            stats={{ serverCount, postCount, resourceCount }}
            recentServers={recentServers}
            recentPosts={recentPosts}
            recentResources={recentResources}
        />
    );
}
