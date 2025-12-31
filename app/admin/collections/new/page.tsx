'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function NewCollectionPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [isOfficial, setIsOfficial] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug,
                    description,
                    thumbnail,
                    isOfficial
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '컬렉션 생성에 실패했습니다');
            }

            router.push('/admin/collections');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12">
            <div className="container max-w-2xl mx-auto px-4">
                <Link href="/admin/collections" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </Link>

                <div className="bg-white dark:bg-zinc-900 border rounded-xl p-8 shadow-sm">
                    <h1 className="text-2xl font-black mb-6">새 컬렉션 만들기</h1>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label block mb-2 font-bold">컬렉션 제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input w-full"
                                placeholder="예: 2024년 최고의 RPG 모드"
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2 font-bold">슬러그 (URL)</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="input w-full font-mono text-sm"
                                placeholder="예: best-rpg-mods-2024"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.</p>
                        </div>

                        <div>
                            <label className="label block mb-2 font-bold">설명</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input w-full h-32 resize-none"
                                placeholder="이 컬렉션에 대한 설명을 작성해주세요."
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2 font-bold">썸네일 이미지 URL</label>
                            <div className="flex gap-2">
                                <span className="flex items-center justify-center w-10 h-10 rounded border bg-muted text-muted-foreground shrink-0">
                                    <ImageIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="url"
                                    value={thumbnail}
                                    onChange={(e) => setThumbnail(e.target.value)}
                                    className="input w-full"
                                    placeholder="https://..."
                                />
                            </div>
                            {thumbnail && (
                                <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
                                    <Image
                                        src={thumbnail}
                                        alt="Thumbnail Preview"
                                        fill
                                        className="object-cover"
                                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isOfficial"
                                checked={isOfficial}
                                onChange={(e) => setIsOfficial(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="isOfficial" className="text-sm font-medium cursor-pointer">
                                공식 컬렉션으로 지정 (Official 뱃지 표시)
                            </label>
                        </div>

                        <div className="pt-4 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                컬렉션 생성하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
