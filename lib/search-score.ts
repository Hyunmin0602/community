import { Grade, SearchContent } from '@prisma/client';

export const GRADE_SCORES: Record<Grade, number> = {
    [Grade.S]: 100,
    [Grade.A]: 80,
    [Grade.B]: 50,
    [Grade.C]: 20,
    [Grade.F]: -50,
};

export const WEIGHTS = {
    TRUST: 5.0,
    RELEVANCE: 3.0,
    ACCURACY: 1.0,
};

// Bonuses
export const BONUSES = {
    KEYWORD_MATCH: 200, // Title match
    DESC_OR_TAG_MATCH: 50, // New: Description or Tag match
    RECENCY: 100,       // Within 7 days
};

export const RECENCY_WINDOW_DAYS = 7;

/**
 * Calculates the base score of a content item based on its grades and view count.
 * This does NOT include query-specific bonuses (text match, intent match).
 */
export function calculateBaseScore(item: Pick<SearchContent, 'trustGrade' | 'relevanceGrade' | 'accuracyGrade' | 'viewCount' | 'createdAt'>) {
    let score = 0;

    // 1. Grade Scoring
    score += (GRADE_SCORES[item.trustGrade] || 0) * WEIGHTS.TRUST;
    score += (GRADE_SCORES[item.relevanceGrade] || 0) * WEIGHTS.RELEVANCE;
    score += (GRADE_SCORES[item.accuracyGrade] || 0) * WEIGHTS.ACCURACY;

    // 2. View Count Bonus (Log scaling)
    if (item.viewCount > 0) {
        score += Math.min(Math.log10(item.viewCount) * 10, 50);
    }

    // 3. Recency Bonus
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(item.createdAt).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= RECENCY_WINDOW_DAYS) {
        score += BONUSES.RECENCY;
    }

    return Math.round(score);
}
