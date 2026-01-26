'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Download, Heart, ThumbsUp, Edit, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';

import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

interface ResourceDetailProps {
    resource: any;
}

const CATEGORY_LABELS: Record<string, string> = {
    MOD: '모드',
    SKIN: '스킨',
    MAP: '맵',
    PLUGIN: '플러그인',
    TEXTURE: '텍스처팩',
    DATAPACK: '데이터팩',
};

export default function ResourceDetail({ resource: initialResource }: ResourceDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [resource, setResource] = useState(initialResource);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialResource._count.likes);

    const fetchLikeStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/resources/${resource.id}/like`);
            const data = await res.json();
            setLiked(data.liked);
        } catch (error) {
            console.error('Failed to fetch like status:', error);
        }
    }, [resource.id]);

    useEffect(() => {
        fetchLikeStatus();
    }, [fetchLikeStatus]);

    const handleDownload = async () => {
        try {
            await fetch(`/api/resources/${resource.id}/download`, {
                method: 'POST',
            });
            setResource((prev: any) => ({
                ...prev,
                downloadCount: prev.downloadCount + 1,
            }));
            window.open(resource.fileUrl, '_blank');
        } catch (error) {
            console.error('Failed to record download:', error);
        }
    };

    const handleLike = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        try {
            const res = await fetch(`/api/resources/${resource.id}/like`, {
                method: 'POST',
            });
            const data = await res.json();
            setLiked(data.liked);
            setLikeCount((prev: number) => (data.liked ? prev + 1 : prev - 1));
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-6 mb-8">
                {/* Header Section */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="badge bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                                {CATEGORY_LABELS[resource.category] || resource.category}
                            </span>
                            {resource.isEditorsChoice && (
                                <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border border-amber-200 dark:border-amber-800">
                                    <Star className="h-3 w-3 fill-current" />
                                    에디터 추천
                                </span>
                            )}
                            {resource.isVerified && (
                                <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border border-blue-200 dark:border-blue-800">
                                    <ShieldCheck className="h-3 w-3" />
                                    구동 확인됨
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{resource.title}</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <span>조회수 {resource.views || 0}</span>
                            <span>•</span>
                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {session?.user?.email === resource.user.email && (
                        <button
                            onClick={() => router.push(`/resources/${resource.id}/edit`)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            내 자료 수정
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Main Content (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Thumbnail */}
                    {resource.thumbnail ? (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border bg-slate-100 dark:bg-zinc-800 shadow-sm">
                            <Image
                                src={resource.thumbnail}
                                alt={resource.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border text-slate-300">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                            <span className="text-2xl">📝</span> 상세 설명
                        </h2>
                        <div className="prose dark:prose-invert max-w-none min-h-[200px]">
                            {resource.description ? (
                                <RichTextEditor value={resource.description} readOnly />
                            ) : (
                                <p className="text-muted-foreground italic">작성된 설명이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 shadow-sm" id="reviews">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                            <span className="text-2xl">⭐</span> 리뷰 및 평가
                        </h2>

                        {session ? (
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-xl border border-dashed">
                                <ReviewForm resourceId={resource.id} />
                            </div>
                        ) : (
                            <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-950/50 rounded-xl border border-dashed text-center">
                                <p className="text-muted-foreground mb-3">로그인하고 솔직한 리뷰를 남겨보세요!</p>
                                <button
                                    onClick={() => router.push(`/auth/signin`)}
                                    className="btn-primary text-sm px-6"
                                >
                                    로그인하기
                                </button>
                            </div>
                        )}
                        <ReviewList resourceId={resource.id} />
                    </div>
                </div>

                {/* Right Column: Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Action Card */}
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-lg sticky top-24">
                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={handleDownload}
                                className="w-full btn-primary h-14 text-lg font-bold flex items-center justify-center gap-2 shadow-blue-500/20 shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <Download className="h-5 w-5" />
                                다운로드
                            </button>
                            <button
                                onClick={handleLike}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${liked
                                    ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/10 dark:border-red-900'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-zinc-700'
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{liked ? '좋아요 취소' : '좋아요'}</span>
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-b mb-6">
                            <div className="text-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <p className="text-xs text-muted-foreground font-medium mb-1">다운로드</p>
                                <p className="text-xl font-black">{resource.downloadCount.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <p className="text-xs text-muted-foreground font-medium mb-1">좋아요</p>
                                <p className="text-xl font-black text-red-500">{likeCount.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <p className="text-xs text-muted-foreground font-medium mb-1">버전</p>
                                <p className="text-lg font-bold">{resource.version || 'All'}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <p className="text-xs text-muted-foreground font-medium mb-1">호환 버전</p>
                                <p className="text-lg font-bold">{resource.supportedVersion || 'All'}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <p className="text-xs text-muted-foreground font-medium mb-1">라이선스</p>
                                <p className="text-lg font-bold">Free</p>
                            </div>
                        </div>

                        {/* Author Info */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                                {resource.user.image ? (
                                    <Image src={resource.user.image} alt="" width={40} height={40} className="rounded-full" />
                                ) : (
                                    (resource.user.name?.[0] || 'U')
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">제작자</p>
                                <p className="font-bold text-sm hover:underline cursor-pointer">
                                    {resource.user.name || resource.user.email.split('@')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {resource.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
