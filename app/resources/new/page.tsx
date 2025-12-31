'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

const CATEGORIES = [
    { value: 'MOD', label: '모드' },
    { value: 'SKIN', label: '스킨' },
    { value: 'MAP', label: '맵' },
    { value: 'PLUGIN', label: '플러그인' },
    { value: 'TEXTURE', label: '텍스처팩' },
    { value: 'DATAPACK', label: '데이터팩' },
];

const TAGS = ['1.20+', '1.19', '1.18', '1.17', '1.16', '생존', '모험', 'PVP', '건축'];

export default function NewResourcePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'MOD' as any,
        fileUrl: '',
        thumbnail: '',
        version: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="py-20 text-center">Loading...</div>;
    }

    if (!session) {
        return null;
    }

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: selectedTags,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '자료 등록에 실패했습니다');
            }

            router.push(`/resources/${data.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-8">
            <div className="max-w-5xl mx-auto">
                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-2">자료 등록</h1>
                    <p className="text-muted-foreground mb-6">
                        모드, 스킨, 맵 등 마인크래프트 자료를 공유하세요
                    </p>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="label block mb-2">
                                제목 *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input w-full"
                                placeholder="예: 엄청난 RPG 모드"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="label block mb-2">
                                카테고리 *
                            </label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                className="input w-full"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="fileUrl" className="label block mb-2">
                                다운로드 링크 *
                            </label>
                            <input
                                type="url"
                                id="fileUrl"
                                value={formData.fileUrl}
                                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                                className="input w-full"
                                placeholder="https://example.com/file.jar"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="thumbnail" className="label block mb-2">
                                썸네일 이미지 URL
                            </label>
                            <input
                                type="url"
                                id="thumbnail"
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                className="input w-full"
                                placeholder="https://example.com/thumbnail.png"
                            />
                        </div>

                        <div>
                            <label htmlFor="version" className="label block mb-2">
                                마인크래프트 버전
                            </label>
                            <input
                                type="text"
                                id="version"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                className="input w-full"
                                placeholder="예: 1.20.4"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="label block mb-2">
                                설명
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                placeholder="자료에 대해 자세히 설명해주세요..."
                            />
                        </div>

                        <div>
                            <label className="label block mb-3">태그</label>
                            <div className="flex flex-wrap gap-2">
                                {TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full flex items-center justify-center space-x-2"
                        >
                            <Plus className="h-5 w-5" />
                            <span>{submitting ? '등록 중...' : '자료 등록하기'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
