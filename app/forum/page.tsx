import { prisma } from '@/lib/prisma';
import PostList from '@/components/forum/PostList';
import { LayoutGrid } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ForumPage() {
    const posts = await prisma.post.findMany({
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">전체 게시글</h1>
                    <p className="text-sm text-muted-foreground">커뮤니티의 모든 최신 글을 모아봅니다.</p>
                </div>
            </div>

            <PostList posts={posts} />
        </div>
    );
}
