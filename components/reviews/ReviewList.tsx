'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReviewListProps {
    resourceId: string;
}

const RATING_CATEGORIES = [
    { key: 'fun', label: '재미' },
    { key: 'graphics', label: '그래픽' },
    { key: 'story', label: '스토리' },
    { key: 'optimization', label: '최적화' },
];

export default function ReviewList({ resourceId }: ReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`/api/reviews?resourceId=${resourceId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [resourceId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Calculate aggregated scores
    const aggregates = reviews.length > 0 ? RATING_CATEGORIES.reduce((acc, cat) => {
        const sum = reviews.reduce((total, review) => {
            const details = review.details as Record<string, number>;
            return total + (details[cat.key] || 0);
        }, 0);
        acc[cat.key] = (sum / reviews.length).toFixed(1);
        return acc;
    }, {} as Record<string, string>) : null;

    if (loading) return <div className="py-10 text-center animate-pulse">로딩 중...</div>;

    return (
        <div className="space-y-8">
            {reviews.length > 0 && aggregates && (
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-6 border">
                    <h3 className="text-lg font-bold mb-4">유저 평가 종합</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {RATING_CATEGORIES.map((cat) => (
                            <div key={cat.key} className="text-center p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                                <span className="text-sm text-muted-foreground block mb-1">{cat.label}</span>
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-xl font-black">{aggregates[cat.key]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="group p-4 rounded-xl border bg-card hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                    {review.user.image ? (
                                        <Image src={review.user.image} alt={review.user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <User className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{review.user.name || '알 수 없는 사용자'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ko })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-bold text-sm">{review.rating}</span>
                            </div>
                        </div>

                        {/* Detailed Ratings Tooltip/Grid */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {RATING_CATEGORIES.map((cat) => {
                                const score = (review.details as Record<string, number>)?.[cat.key];
                                if (!score) return null;
                                return (
                                    <span key={cat.key} className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                                        {cat.label} {score}
                                    </span>
                                );
                            })}
                        </div>

                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {review.content}
                        </p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
                    </div>
                )}
            </div>
        </div>
    );
}
