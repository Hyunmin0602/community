import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CommentSection from '@/components/forum/CommentSection';
import nextDynamic from 'next/dynamic';
const RichTextEditor = nextDynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Clock, Eye, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PostActions from '@/components/forum/PostActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    };
}

import { FORUM_CATEGORY_LABELS, FORUM_CATEGORY_COLORS } from '@/lib/constants';

export default async function PostDetailPage({ params }: PageProps) {
    // Increment views via API call ideally, but in Server Component we can do it directly.
    // However, updating DB in a GET request (rendering) is sometimes frowned upon in Server Components due to cache/revalidation complications.
    // But for view count, it's often acceptable or done via client useEffect.
    // Let's do it here for simplicity, but use updateMany to avoid error if not found (though findUnique first is safer).

    // First fetch post
    const post = await prisma.post.findUnique({
        where: { id: params.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc', // 댓글은 작성 순으로
                },
            },
        },
    });

    if (!post) {
        notFound();
    }

    // Update views asynchronously (fire and forget)
    // In Vercel serverless, this might not complete if response ends. 
    // Ideally use `await` or separate API.
    await prisma.post.update({
        where: { id: params.id },
        data: { views: { increment: 1 } },
    });

    const session = await getServerSession(authOptions);
    const isAuthor = session?.user?.id === post.userId;

    return (
        <div className="space-y-6">
            <Link href="/forum" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <div className="card p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="space-y-4 border-b pb-6">
                    <div className="flex items-start justify-between">
                        <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${FORUM_CATEGORY_COLORS[post.category] || 'bg-gray-100'}`}>
                            {FORUM_CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        <PostActions postId={post.id} isAuthor={isAuthor} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                                {post.user.image ? (
                                    <Image src={post.user.image} alt={post.user.name || ''} fill className="object-cover" />
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </div>
                            <span className="font-medium text-foreground">{post.user.name || '익명'}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                        </span>
                        <div className="w-px h-3 bg-border" />
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {post.views + 1}
                        </span>
                        <div className="w-px h-3 bg-border" />
                        <Link href="#comments" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.comments.length}
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[200px]">
                    <RichTextEditor value={post.content} readOnly />
                </div>
            </div>

            {/* Comments */}
            <div id="comments" className="card p-6">
                <CommentSection postId={post.id} initialComments={post.comments} />
            </div>
        </div>
    );
}
