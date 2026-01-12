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
// 1일 (밀리초)
const ONE_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates the base score of a content item based on its grades, popularity, and quality signals.
 * This does NOT include query-specific bonuses (text match, intent match).
 */
export function calculateBaseScore(item: {
    trustGrade: Grade;
    relevanceGrade: Grade;
    accuracyGrade: Grade;
    viewCount: number;
    likeCount: number;
    reportCount: number;
    impressions: number;
    clicks: number;
    commentCount: number;
    createdAt: Date;
    // New V2 Fields
    contentLength: number;
    readabilityScore: number;
    lastActive: Date;
}) {
    let score = 0;

    // 1. Grade Scoring (Base Quality)
    score += (GRADE_SCORES[item.trustGrade] || 0) * WEIGHTS.TRUST;
    score += (GRADE_SCORES[item.relevanceGrade] || 0) * WEIGHTS.RELEVANCE;
    score += (GRADE_SCORES[item.accuracyGrade] || 0) * WEIGHTS.ACCURACY;

    // 2. Report Penalty (Enhanced Quality Control)
    // - Threshold: 8 reports
    // - Penalty: 10 points per report
    // - Trust Score Impact: Handled in report creation logic, reflected here via Grade if verified
    if (item.reportCount >= 8) {
        score -= item.reportCount * 10;
    }

    // 3. Content Quality Score (V2 Metrics)
    // 3-1. Content Length (Logarithmic Scale)
    // < 50 chars: 0 pts
    // Log10(length) * 20 -> 1000 chars ~= 60 pts
    if (item.contentLength >= 50) {
        const lengthScore = Math.log10(item.contentLength) * 20;
        score += Math.min(Math.round(lengthScore), 100); // Cap at 100
    }

    // 3-2. Readability Score (0-100)
    // Provided by ContentAnalyzer during creation
    if (item.readabilityScore > 0) {
        score += Math.round(item.readabilityScore * 0.5); // Weight 0.5 (Max 50 pts)
    }

    // 4. Popularity Score (Views + Likes + CTR + Comments)
    let popScore = 0;

    // View Bonus: Log scale, Max 150 points
    if (item.viewCount > 0) {
        popScore += Math.min(Math.log10(item.viewCount) * 40, 150);
    }

    // Like Bonus: Linear scale, Max 100 points
    if (item.likeCount > 0) {
        popScore += Math.min(item.likeCount * 0.2, 100);
    }

    // CTR Bonus: Max 500 points
    // High CTR (e.g., 10%) -> (clicks / impressions) * 500
    // We add +1 to impressions to avoid division by zero and dampen low traffic noise
    if (item.impressions > 0) {
        const ctr = item.clicks / (item.impressions + 10); // Smoothing with +10
        popScore += Math.min(ctr * 500, 500);
    }

    // Comment Activity Bonus: Max 100 points
    // Active discussion suggests engagement
    if (item.commentCount > 0) {
        popScore += Math.min(item.commentCount * 10, 100);
    }

    // Dwell Time Bonus (New)
    // Average dwell time > 30s -> Boost
    // This requires aggregation logic, assuming dwellTime is passed or calculated externally
    // For now, we rely on click quality which correlates with dwell time (BOUNCE rate)

    // 5. Time Decay for Popularity Score (Anti-Stagnation)
    // Using lastActive instead of createdAt for decay base if possible
    const lastActiveDate = new Date(item.lastActive || item.createdAt);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastActiveDate.getTime());
    const diffDays = diffTime / ONE_DAY;

    const avgDailyViews = diffDays > 0 ? item.viewCount / diffDays : item.viewCount;
    const isTrending = avgDailyViews >= 30; // Evergreen/Trending condition

    let decayFactor = 1.0;

    if (diffDays <= 7) {
        decayFactor = 1.0; // 0~7 days: 100%
    } else if (diffDays <= 14) {
        decayFactor = 0.9; // 8~14 days: 90%
    } else if (diffDays <= 30) {
        decayFactor = 0.7; // 15~30 days: 70%
    } else {
        // After 30 days
        if (isTrending) {
            decayFactor = 0.8; // Evergreen content keeps 80%
        } else {
            decayFactor = 0.5; // Stagnant content drops to 50%
        }
    }

    score += Math.round(popScore * decayFactor);

    // 6. Recency Bonus (Freshness Boost)
    if (diffDays <= RECENCY_WINDOW_DAYS) {
        score += BONUSES.RECENCY;
    }

    return Math.round(score);
}
