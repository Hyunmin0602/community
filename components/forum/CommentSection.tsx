'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Send, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    postId: string;
    initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !session) return;

        setIsLoading(true);
        try {
            // API Route for comments needs to be created or I'll use a new route
            // I haven't created /api/posts/[id]/comments yet.
            // I'll assume /api/comments or /api/posts/[id]/comments
            // Let's use /api/comments and pass postId in body for simplicity or follows structure.
            // But wait, standard is usually sub-resource.
            // I'll create /api/comments route later.

            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    content,
                }),
            });

            if (!res.ok) throw new Error('Failed to comment');

            const newComment = await res.json();
            setComments((prev) => [...prev, newComment]);
            setContent('');
            router.refresh(); // Refresh server data too
        } catch (error) {
            console.error(error);
            alert('댓글 작성 실패');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            setComments((prev) => prev.filter((c) => c.id !== commentId));
            router.refresh();
        } catch (error) {
            alert('삭제 실패');
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
                댓글 <span className="text-primary">{comments.length}</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                            {comment.user.image ? (
                                <Image src={comment.user.image} alt={comment.user.name || ''} fill className="object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                    {comment.user.name || '익명'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                                </span>
                                {session?.user?.id === comment.user.id && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Form */}
            {session ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="btn-primary p-2 aspect-square flex items-center justify-center rounded-lg"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </form>
            ) : (
                <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    댓글을 작성하려면 로그인이 필요합니다.
                </div>
            )}
        </div>
    );
}
