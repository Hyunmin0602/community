'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { LayoutGrid, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function WritePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('FREE');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    category,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || '게시글 작성에 실패했습니다.');
            }

            const data = await res.json();
            router.push(`/forum/post/${data.id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('게시글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="card p-12 text-center">
                <p className="text-muted-foreground mb-4">로그인이 필요한 서비스입니다.</p>
                <button onClick={() => router.push('/auth/signin')} className="btn-primary">
                    로그인하기
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">글쓰기</h1>
                    <p className="text-sm text-muted-foreground">자유롭게 이야기를 나눠보세요.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="FREE">자유</option>
                            <option value="QUESTION">질문</option>
                            <option value="TIP">팁</option>
                            {/* NOTICE는 관리자만 보이게 할 수도 있지만, 일단은 숨기지 않고 API에서 막거나 표시하지 않음 */}
                        </select>
                    </div>
                    <div className="col-span-3">
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="내용을 입력하세요..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-ghost"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary min-w-[100px]"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                            '등록'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
