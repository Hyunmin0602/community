'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { RESOURCE_CATEGORIES, RESOURCE_TAGS } from '@/lib/constants';

interface ResourceFormProps {
    resourceId: string;
    initialData: {
        title: string;
        description: string;
        category: string;
        fileUrl: string;
        thumbnail: string;
        version: string;
        tags: string[];
    };
}

export default function ResourceForm({ resourceId, initialData }: ResourceFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData.tags || []);
    const [formData, setFormData] = useState({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        fileUrl: initialData.fileUrl,
        thumbnail: initialData.thumbnail,
        version: initialData.version,
    });

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
            const res = await fetch(`/api/resources/${resourceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: selectedTags,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '자료 수정에 실패했습니다');
            }

            router.push(`/resources/${resourceId}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                    required
                >
                    {RESOURCE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="description" className="label block mb-2">
                    설명
                </label>
                <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="자료에 대한 상세 설명을 입력하세요"
                />
            </div>

            <div>
                <label htmlFor="fileUrl" className="label block mb-2">
                    파일 URL *
                </label>
                <input
                    type="url"
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="input w-full"
                    placeholder="https://example.com/file.zip"
                    required
                />
            </div>

            <div>
                <label htmlFor="thumbnail" className="label block mb-2">
                    썸네일 URL
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
                    버전
                </label>
                <input
                    type="text"
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="input w-full"
                    placeholder="1.20.4"
                />
            </div>

            <div>
                <label className="label block mb-2">태그</label>
                <div className="flex flex-wrap gap-2">
                    {RESOURCE_TAGS.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1"
                >
                    {submitting ? '수정 중...' : '수정하기'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                >
                    취소
                </button>
            </div>
        </form>
    );
}
