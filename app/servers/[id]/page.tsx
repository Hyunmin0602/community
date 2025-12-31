import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ServerDetail from './ServerDetail';

export async function generateMetadata({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> {
    const server = await prisma.server.findUnique({
        where: { id: params.id },
    });

    if (!server) {
        return {
            title: '서버를 찾을 수 없습니다',
        };
    }

    return {
        title: `${server.name} - 마크 커뮤니티`,
        description: server.description || `${server.name} 마인크래프트 서버 정보`,
    };
}

export default async function ServerPage({ params }: { params: { id: string } }) {
    const server = await prisma.server.findUnique({
        where: { id: params.id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });

    if (!server) {
        notFound();
    }

    return <ServerDetail server={server} />;
}
