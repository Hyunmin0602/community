'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostActionsProps {
    postId: string;
    isAuthor: boolean;
}

export default function PostActions({ postId, isAuthor }: PostActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!isAuthor) return null;

    const handleDelete = async () => {
        if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('게시글이 삭제되었습니다.');
            router.push('/forum');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('게시글 삭제에 실패했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
            >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-background border rounded-lg shadow-lg py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        삭제
                    </button>
                </div>
            )}

            {/* Backdrop to close menu */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
