import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ResourceDetail from './ResourceDetail';

export async function generateMetadata({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> {
    const resource = await prisma.resource.findUnique({
        where: { id: params.id },
    });

    if (!resource) {
        return {
            title: '자료를 찾을 수 없습니다',
        };
    }

    return {
        title: `${resource.title} - 마크 커뮤니티`,
        description: resource.description || `${resource.title} 다운로드`,
    };
}

export default async function ResourcePage({ params }: { params: { id: string } }) {
    const resource = await prisma.resource.findUnique({
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
                    likes: true,
                    comments: true,
                },
            },
        },
    });

    if (!resource) {
        notFound();
    }

    return <ResourceDetail resource={resource} />;
}
