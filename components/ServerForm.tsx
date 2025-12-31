'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Loader2 } from 'lucide-react';
import { Server } from '@prisma/client';
import Image from 'next/image';

const AVAILABLE_TAGS = [
    '24시간 운영',
    '오리지널',
    'EULA 준수',
    '한국 서버',
    '생존 모드',
    'PVP',
    '크리에이티브',
    '미니게임',
];

// Prisma Client의 타입이 아직 업데이트되지 않았을 경우를 대비해 확장 타입 정의
interface ExtendedServer {
    name: string;
    description: string | null;
    host: string;
    port: number;
    type: 'JAVA' | 'BEDROCK';
    version?: string | null;
    banner?: string | null;
    website?: string | null;
    discord?: string | null;
    tags?: string[];
}

interface ServerFormProps {
    initialData?: Partial<ExtendedServer>;
    mode: 'create' | 'edit';
    serverId?: string;
}

export default function ServerForm({ initialData, mode, serverId }: ServerFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        host: initialData?.host || '',
        port: initialData?.port || 25565,
        type: (initialData?.type as 'JAVA' | 'BEDROCK') || 'JAVA',
        version: initialData?.version || '',
        banner: initialData?.banner || '',
        website: initialData?.website || '',
        discord: initialData?.discord || '',
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
            const url = mode === 'create' ? '/api/servers' : `/api/servers/${serverId}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: selectedTags,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `서버 ${mode === 'create' ? '등록' : '수정'}에 실패했습니다`);
            }

            if (mode === 'create') {
                router.push(`/servers/${data.id}`);
            } else {
                router.push(`/servers/${serverId}`);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="label block mb-2">
                    서버 이름 *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="예: 픽셀릿 서버"
                    required
                />
            </div>

            <div>
                <label htmlFor="type" className="label block mb-2">
                    서버 타입 *
                </label>
                <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as 'JAVA' | 'BEDROCK' })
                    }
                    className="input w-full"
                >
                    <option value="JAVA">자바 에디션</option>
                    <option value="BEDROCK">베드락 에디션</option>
                </select>
            </div>

            <div>
                <label htmlFor="version" className="label block mb-2">
                    서버 버전
                </label>
                <input
                    type="text"
                    id="version"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="input w-full"
                    placeholder="예: 1.20.4"
                />
            </div>

            <div>
                <label htmlFor="host" className="label block mb-2">
                    서버 주소 (IP) *
                </label>
                <input
                    type="text"
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="input w-full"
                    placeholder="예: play.pixelit.kr"
                    required
                />
            </div>

            <div>
                <label htmlFor="port" className="label block mb-2">
                    포트 *
                </label>
                <input
                    type="number"
                    id="port"
                    value={formData.port}
                    onChange={(e) =>
                        setFormData({ ...formData, port: parseInt(e.target.value) })
                    }
                    className="input w-full"
                    min="1"
                    max="65535"
                    required
                />
                <p className="text-sm text-muted-foreground mt-1">
                    기본값 - 자바: 25565, 베드락: 19132
                </p>
            </div>

            <div>
                <label htmlFor="description" className="label block mb-2">
                    서버 설명
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="input w-full h-32 resize-none"
                    placeholder="서버에 대해 자랑해주세요!"
                />
            </div>

            <div>
                <label htmlFor="banner" className="label block mb-2">
                    배너 이미지 URL
                </label>
                <input
                    type="url"
                    id="banner"
                    value={formData.banner}
                    onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                    className="input w-full"
                    placeholder="https://example.com/banner.png"
                />
                {formData.banner && (
                    <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">미리보기:</p>
                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={formData.banner}
                                alt="배너 미리보기"
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="website" className="label block mb-2">
                        웹사이트 URL
                    </label>
                    <input
                        type="url"
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="input w-full"
                        placeholder="https://pixelit.kr"
                    />
                </div>
                <div>
                    <label htmlFor="discord" className="label block mb-2">
                        디스코드 초대 링크
                    </label>
                    <input
                        type="url"
                        id="discord"
                        value={formData.discord}
                        onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                        className="input w-full"
                        placeholder="https://discord.gg/..."
                    />
                </div>
            </div>

            <div>
                <label className="label block mb-3">서버 태그</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
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
                {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : mode === 'create' ? (
                    <Plus className="h-5 w-5" />
                ) : (
                    <Save className="h-5 w-5" />
                )}
                <span>
                    {submitting
                        ? '처리 중...'
                        : mode === 'create'
                            ? '서버 등록하기'
                            : '수정사항 저장'}
                </span>
            </button>
        </form>
    );
}
