
console.log("Starting Standalone Scoring Tests...");

// --- Mocked Enums & Constants from search-score.ts ---
const Grade = {
    S: 'S', A: 'A', B: 'B', C: 'C', F: 'F'
};

const GRADE_SCORES = {
    [Grade.S]: 100,
    [Grade.A]: 80,
    [Grade.B]: 50,
    [Grade.C]: 20,
    [Grade.F]: -50,
};

const WEIGHTS = {
    TRUST: 5.0,
    RELEVANCE: 3.0,
    ACCURACY: 1.0,
};

const BONUSES = {
    KEYWORD_MATCH: 200,
    DESC_OR_TAG_MATCH: 50,
    RECENCY: 100,
};

const RECENCY_WINDOW_DAYS = 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

// --- Copied Logic from search-score.ts ---
function calculateBaseScore(item: any) {
    let score = 0;

    // 1. Grade Scoring (Base Quality)
    score += (GRADE_SCORES[item.trustGrade] || 0) * WEIGHTS.TRUST;
    score += (GRADE_SCORES[item.relevanceGrade] || 0) * WEIGHTS.RELEVANCE;
    score += (GRADE_SCORES[item.accuracyGrade] || 0) * WEIGHTS.ACCURACY;

    // 2. Report Penalty
    if (item.reportCount >= 8) {
        score -= item.reportCount * 10;
    }

    // 3. Content Quality Score (V2 Metrics)
    if (item.contentLength >= 50) {
        const lengthScore = Math.log10(item.contentLength) * 20;
        score += Math.min(Math.round(lengthScore), 100);
    }

    if (item.readabilityScore > 0) {
        score += Math.round(item.readabilityScore * 0.5);
    }

    // 4. Popularity Score
    let popScore = 0;
    if (item.viewCount > 0) {
        popScore += Math.min(Math.log10(item.viewCount) * 40, 150);
    }
    if (item.likeCount > 0) {
        popScore += Math.min(item.likeCount * 0.2, 100);
    }
    if (item.impressions > 0) {
        const ctr = item.clicks / (item.impressions + 10);
        popScore += Math.min(ctr * 500, 500);
    }
    if (item.commentCount > 0) {
        popScore += Math.min(item.commentCount * 10, 100);
    }

    // 5. Time Decay
    const lastActiveDate = new Date(item.lastActive || item.createdAt);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastActiveDate.getTime());
    const diffDays = diffTime / ONE_DAY;

    const avgDailyViews = diffDays > 0 ? item.viewCount / diffDays : item.viewCount;
    const isTrending = avgDailyViews >= 30;

    let decayFactor = 1.0;
    if (diffDays <= 7) decayFactor = 1.0;
    else if (diffDays <= 14) decayFactor = 0.9;
    else if (diffDays <= 30) decayFactor = 0.7;
    else {
        if (isTrending) decayFactor = 0.8;
        else decayFactor = 0.5;
    }

    score += Math.round(popScore * decayFactor);

    // 6. Recency Bonus
    if (diffDays <= RECENCY_WINDOW_DAYS) {
        score += BONUSES.RECENCY;
    }

    return Math.round(score);
}

// --- Tests ---

const baseItem = {
    trustGrade: 'B',
    relevanceGrade: 'B',
    accuracyGrade: 'B',
    viewCount: 0,
    likeCount: 0,
    reportCount: 0,
    impressions: 0,
    clicks: 0,
    commentCount: 0,
    createdAt: new Date(),
    contentLength: 0,
    readabilityScore: 0,
    lastActive: new Date(),
};

function test(name: string, item: any, expectedMin: number, expectedMax: number) {
    const score = calculateBaseScore({ ...baseItem, ...item });
    const passed = score >= expectedMin && score <= expectedMax;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: Score ${score} (Expected ${expectedMin}~${expectedMax})`);
}

// Base Score: (50*5) + (50*3) + (50*1) = 250 + 150 + 50 = 450.
// Recency Bonus: +100 (Fresh).
// Total Base = 550.

test('Base Score (Fresh)', {}, 550, 550);

// 1. Report Penalty Test
// Threshold is 8. So 7 reports should have NO penalty.
// Score = 550.
test('Report Count 7 (No Penalty)', { reportCount: 7 }, 550, 550);

// 8 reports -> -80 pts. 
// Score = 550 - 80 = 470.
test('Report Count 8 (Penalty Active)', { reportCount: 8 }, 470, 470);

// 10 reports -> -100 pts.
// Score = 550 - 100 = 450.
test('Report Count 10 (Penalty Active)', { reportCount: 10 }, 450, 450);

// 2. Content Length Test 
// 100 chars -> log10(100)*20 = 2*20 = 40.
// Score = 550 + 40 = 590.
test('Length 100 (Score 40)', { contentLength: 100 }, 590, 590);

// 1000 chars -> log10(1000)*20 = 3*20 = 60.
// Score = 550 + 60 = 610.
test('Length 1000 (Score 60)', { contentLength: 1000 }, 610, 610);

// 3. Readability Test
// 50 score -> 25 pts.
// Score = 550 + 25 = 575.
test('Readability 50 (Score 25)', { readabilityScore: 50 }, 575, 575);

console.log("Tests Completed.");
