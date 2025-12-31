import { prisma } from '@/lib/prisma';
import PostList from '@/components/forum/PostList';
import { MessageSquare, HelpCircle, Lightbulb, Megaphone } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PostCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        category: string;
    };
}

const categoryMap: Record<string, { db: PostCategory; title: string; desc: string; icon: any }> = {
    free: {
        db: 'FREE',
        title: '자유게시판',
        desc: '자유롭게 이야기를 나누는 공간입니다.',
        icon: MessageSquare,
    },
    question: {
        db: 'QUESTION',
        title: '질문게시판',
        desc: '궁금한 점을 질문하고 답변을 받아보세요.',
        icon: HelpCircle,
    },
    tip: {
        db: 'TIP',
        title: '팁과 노하우',
        desc: '나만의 꿀팁과 노하우를 공유해보세요.',
        icon: Lightbulb,
    },
    notice: {
        db: 'NOTICE',
        title: '공지사항',
        desc: '커뮤니티의 중요 소식을 확인하세요.',
        icon: Megaphone,
    },
};

export default async function CategoryPage({ params }: PageProps) {
    const categoryInfo = categoryMap[params.category];

    if (!categoryInfo) {
        notFound();
    }

    const posts = await prisma.post.findMany({
        where: {
            category: categoryInfo.db,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                    likes: true,
                },
            },
        },
        take: 20,
    });

    const Icon = categoryInfo.icon;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{categoryInfo.title}</h1>
                    <p className="text-sm text-muted-foreground">{categoryInfo.desc}</p>
                </div>
            </div>

            <PostList posts={posts} />
        </div>
    );
}
