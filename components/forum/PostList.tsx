import Link from 'next/link';
import { MessageSquare, Heart, Eye, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    views: number;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
    _count: {
        comments: number;
        likes: number;
    };
}

interface PostListProps {
    posts: Post[];
    emptyMessage?: string;
}

const categoryLabels: Record<string, string> = {
    FREE: '자유',
    QUESTION: '질문',
    TIP: '팁',
    NOTICE: '공지',
    ALL: '전체',
};

const categoryColors: Record<string, string> = {
    FREE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    QUESTION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TIP: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    NOTICE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function PostList({ posts, emptyMessage = '게시글이 없습니다.' }: PostListProps) {
    if (posts.length === 0) {
        return (
            <div className="card p-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="card divide-y">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/forum/post/${post.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors group"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                                    {categoryLabels[post.category] || post.category}
                                </span>
                                <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                {post.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                    <span className="text-[10px] text-red-500 font-bold">N</span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {post.user.name || '익명'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                                </span>
                                <span className="flex items-center gap-1 ml-auto">
                                    <Eye className="h-3 w-3" />
                                    {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {post._count.likes}
                                </span>
                                <span className="flex items-center gap-1 text-primary/80">
                                    <MessageSquare className="h-3 w-3" />
                                    {post._count.comments}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
