
import { prisma } from '@/lib/prisma';
import { analyzeSearchQuery, SearchIntent } from '@/lib/ai-search';
import { calculateBaseScore, BONUSES } from '@/lib/search-score';
import { SearchContent } from '@prisma/client';
import { ContentAnalyzer } from '@/lib/content-analyzer';

export type SearchResult = SearchContent & {
    score: number;
    fuzzy_score?: number; // Added from raw query
    scoreBreakdown: {
        base: number;
        keywordMatch: number;
        descOrTagMatch: number;
        intentBonus: number;
    };
};

export type SearchResponse = {
    intent: SearchIntent;
    results: SearchResult[];
    searchTerms: string[];
};

export async function performSearch(query: string, sortBy: 'RELEVANCE' | 'POPULARITY' | 'LATEST' = 'RELEVANCE'): Promise<SearchResponse> {
    // 1. AI Intent Analysis
    const intent = await analyzeSearchQuery(query);

    // Override sort if intent detects a specific sort order and none was explicitly requested (default)
    // But if the user clicks a sort button, `sortBy` argument should take precedence.
    // However, the function caller will control this. If caller passes 'RELEVANCE' (default), we might want to respect intent.
    // Let's assume the caller will explicitly pass 'POPULARITY' or 'LATEST' if the UI filter is active.
    // If UI is default, we can use intent.sort.

    const finalSort = sortBy !== 'RELEVANCE' ? sortBy : (intent.sort || 'RELEVANCE');

    const initialTerms = [query, ...intent.keywords, ...intent.filters.tags].filter(Boolean);

    // 1.5 Keyword Expansion (Synonyms)
    const expandedTerms = new Set<string>(initialTerms);

    // Split query into words to find partial matches (e.g. "마팜 서버" -> "마팜")
    const queryTokens = query.split(/\s+/).filter(t => t.length > 1);

    type ExpandedKeyword = { term: string; synonyms: string[]; category: string | null };
    let foundKeywords: ExpandedKeyword[] = [];

    try {
        const results = await prisma.searchKeyword.findMany({
            where: {
                OR: [
                    { term: { in: queryTokens, mode: 'insensitive' } },
                    { synonyms: { hasSome: queryTokens } }
                ]
            }
        });
        foundKeywords = results;

        results.forEach((kw: { term: string; synonyms: string[] }) => {
            expandedTerms.add(kw.term); // Add the official term
            kw.synonyms.forEach((s: string) => expandedTerms.add(s)); // Add all synonyms
        });
    } catch (e) {
        console.error("Keyword expansion failed", e);
    }

    const searchTerms = Array.from(expandedTerms);

    // 2. Fetch Unified Search Content
    // Use raw query to leverage pg_trgm

    // Dynamic Order Clause
    // Prisma queryRaw doesn't support dynamic identifiers easily, so we use logic fields.
    const searchResults = await prisma.$queryRaw<SearchResult[]>`
        SELECT *,
        (
            CASE 
                WHEN title % ${query} THEN 1.0  -- High capability match
                ELSE SIMILARITY(title, ${query}) -- 0.0 ~ 1.0 score
            END
        ) as fuzzy_score
        FROM "SearchContent"
        WHERE "isHidden" = false
        AND "deletedAt" IS NULL
        AND (
            title % ${query} -- Matches if similarity > limit (default 0.3)
            OR SIMILARITY(title, ${query}) > 0.1 -- Broaden search for typos
            OR EXISTS (
                SELECT 1 
                FROM unnest(${searchTerms}::text[]) as t 
                WHERE 
                    "SearchContent".title ILIKE '%' || t || '%'
                    OR "SearchContent".description ILIKE '%' || t || '%'
                    OR EXISTS (
                        SELECT 1 FROM unnest("SearchContent".tags) as tag
                        WHERE tag ILIKE '%' || t || '%'
                    )
                    OR EXISTS (
                        SELECT 1 FROM unnest("SearchContent".keywords) as kw
                        WHERE kw ILIKE '%' || t || '%'
                    )
            )
        )
        ORDER BY 
            CASE WHEN ${finalSort} = 'POPULARITY' THEN "viewCount" ELSE 0 END DESC,
            CASE WHEN ${finalSort} = 'LATEST' THEN EXTRACT(EPOCH FROM "createdAt") ELSE 0 END DESC,
            fuzzy_score DESC, 
            "viewCount" DESC
        LIMIT 50;
    `;

    const queryLower = query.toLowerCase();

    // 3. Score Calculation
    const scoredResults: SearchResult[] = searchResults.map(item => {
        let score = 0;
        const baseScore = calculateBaseScore(item);
        score += baseScore;

        let keywordMatch = 0;
        let descOrTagMatch = 0;
        let intentBonus = 0;

        // Title Match (+200) - Check against ANY expanded term to be generous
        const titleLower = item.title.toLowerCase();
        if (searchTerms.some(t => titleLower.includes(t.toLowerCase()))) {
            keywordMatch += BONUSES.KEYWORD_MATCH;
        }

        // Description or Tag Match (+50)
        const descMatch = searchTerms.some(t => (item.description || '').toLowerCase().includes(t.toLowerCase()));
        const tags = item.tags || [];
        const tagMatch = tags.some(tag => searchTerms.some(t => tag.toLowerCase().includes(t.toLowerCase())));

        if (descMatch || tagMatch) {
            descOrTagMatch += BONUSES.DESC_OR_TAG_MATCH;
        }

        // Intent Bonus (Category Match)
        if (intent.category === 'NAVIGATION' && item.type === 'SERVER') intentBonus += 200;
        if (intent.category === 'SERVER' && item.type === 'SERVER') intentBonus += 200;
        if (intent.category === 'GUIDE' && item.type === 'WIKI') intentBonus += 100;
        if (intent.category === 'RESOURCE' && item.type === 'RESOURCE') intentBonus += 100;

        // SubCategory Matching (Tags)
        if (intent.subCategory) {
            // Simple mapping or checking if tags contain the subCategory name loosely
            // E.g. MODS -> "Mod"
            const subCatMap: Record<string, string[]> = {
                'NEWS': ['Update', 'News', 'Snapshot', 'Patch'],
                'MODS': ['Mod', 'Addon'],
                'MAPS': ['Map', 'World', 'Save'],
                'PLUGINS': ['Plugin'],
                'SCRIPTS': ['Skript'],
                'DEV_QUESTION': ['Dev', 'Code', 'API']
            };
            const targetTags = subCatMap[intent.subCategory] || [intent.subCategory];
            const hasSubTag = tags.some(tag => targetTags.some(tt => tag.toLowerCase().includes(tt.toLowerCase())));

            if (hasSubTag) intentBonus += 150; // Boost for specific sub-intent
        }

        // Fuzzy Match Bonus (+300 for high similarity)
        // item.fuzzy_score comes from the raw query (0.0 to 1.0)
        let fuzzyBonus = 0;
        if (item.fuzzy_score && item.fuzzy_score > 0.3) {
            fuzzyBonus = Math.floor(item.fuzzy_score * 300);
        }

        score += keywordMatch + descOrTagMatch + intentBonus + fuzzyBonus;

        return {
            ...item,
            score,
            scoreBreakdown: {
                base: baseScore,
                keywordMatch,
                descOrTagMatch,
                intentBonus,
                // @ts-ignore: Adding dynamic property for diagnostics
                fuzzyBonus
            }
        };
    }).sort((a, b) => {
        // If sorting is explicitly requested, we might want to respect it purely?
        // But usually, even with sorting, we might want some relevance/grouping.
        // For now, let's keep score sort as primary UNLESS 'LATEST' or 'POPULARITY' is dominant.
        // Actually, if user asks for "Latest", the SQL ordered by Latest.
        // But this JS sort overrides it.

        if (finalSort === 'LATEST') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (finalSort === 'POPULARITY') {
            return b.viewCount - a.viewCount;
        }
        return b.score - a.score;
    });

    return {
        intent,
        results: scoredResults,
        searchTerms
    };
}

// --- Helper for Transactional Indexing ---
import { Prisma } from '@prisma/client';

export function createSearchContentTx(data: {
    type: 'SERVER' | 'RESOURCE' | 'WIKI' | 'POST' | 'COLLECTION',
    id: string,
    title: string,
    description?: string,
    tags?: string[],
    thumbnail?: string,
    userId?: string
}) {
    // Return the Prisma Promise (to be awaited inside $transaction)

    // Construct link based on type
    let link = '/';
    if (data.type === 'SERVER') link = `/servers/${data.id}`;
    if (data.type === 'RESOURCE') link = `/resources/${data.id}`;
    if (data.type === 'WIKI') link = `/wiki/${data.title}`; // Slug would be better if available
    if (data.type === 'POST') link = `/forum/posts/${data.id}`;
    // if (data.type === 'COLLECTION') link = `/collections/${data.id}`;

    return prisma.searchContent.create({
        data: {
            type: data.type,
            // originalId: data.id, // Removed: Not in schema, using specific FKs below
            title: data.title,
            description: data.description || '',
            tags: data.tags || [],
            thumbnail: data.thumbnail,
            link,
            // Link references
            serverId: data.type === 'SERVER' ? data.id : undefined,
            resourceId: data.type === 'RESOURCE' ? data.id : undefined,
            wikiId: data.type === 'WIKI' ? data.id : undefined,
            postId: data.type === 'POST' ? data.id : undefined,
            // Initialize metrics
            viewCount: 0,
            likeCount: 0,
            // Calculate initial quality metrics (Simple version)
            contentLength: ContentAnalyzer.calculateLength(data.description || ''),
            readabilityScore: ContentAnalyzer.calculateReadability(data.description || ''),
            lastActive: new Date(),
        }
    });
}
