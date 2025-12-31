'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
    resourceId: string;
    onReviewSubmitted?: () => void;
}

const RATING_CATEGORIES = [
    { key: 'fun', label: '재미' },
    { key: 'graphics', label: '그래픽' },
    { key: 'story', label: '스토리' },
    { key: 'optimization', label: '최적화' },
];

export default function ReviewForm({ resourceId, onReviewSubmitted }: ReviewFormProps) {
    const router = useRouter();
    const [ratings, setRatings] = useState<Record<string, number>>({
        fun: 0,
        graphics: 0,
        story: 0,
        optimization: 0,
    });
    const [content, setContent] = useState('');
    const [hoveredRating, setHoveredRating] = useState<{ key: string; value: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingChange = (key: string, value: number) => {
        setRatings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Ensure all categories have at least 1 star
        const isAllRated = Object.values(ratings).every((r) => r > 0);
        if (!isAllRated) {
            alert('모든 항목에 대해 별점을 매겨주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate average rating
            const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0);
            const averageRating = Math.round(totalScore / Object.keys(ratings).length);

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId,
                    rating: averageRating,
                    details: ratings,
                    content,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit review');

            if (onReviewSubmitted) onReviewSubmitted();

            // Reset form
            setContent('');
            setRatings({ fun: 0, graphics: 0, story: 0, optimization: 0 });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('리뷰 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">상세 리뷰 작성</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                {RATING_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground w-20">{cat.label}</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(cat.key, star)}
                                    onMouseEnter={() => setHoveredRating({ key: cat.key, value: star })}
                                    onMouseLeave={() => setHoveredRating(null)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 ${(hoveredRating?.key === cat.key ? hoveredRating.value >= star : ratings[cat.key] >= star)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="이 자료에 대한 솔직한 후기를 남겨주세요. (선택사항)"
                    className="w-full min-h-[100px] p-3 rounded-lg border bg-background focus:ring-2 focus:ring-indigo-500 resize-none"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? '등록 중...' : '리뷰 등록'}
                </button>
            </div>
        </form>
    );
}
