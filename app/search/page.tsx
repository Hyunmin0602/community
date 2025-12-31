import { prisma } from '@/lib/prisma';
import { analyzeSearchQuery } from '@/lib/ai-search';
import { Sparkles, Server as ServerIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ContentType, Grade } from '@prisma/client';
import { calculateBaseScore, BONUSES } from '@/lib/search-score';
import ServerBannerCard from '@/components/search/ServerBannerCard';
import WikiResultList from '@/components/search/WikiResultList';
import PostResultList from '@/components/search/PostResultList';
import ResourceResultList from '@/components/search/ResourceResultList';
import NavigationShortcut from '@/components/search/NavigationShortcut';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams.q || '';

    if (!query) {
        const exampleQueries = [
            "초보도 할 수 있는 건축 자료 있어?",
            "친구랑 할 만한 생존 서버 추천해줘",
            "레드스톤 자동문 만드는 법",
            "PVP 잘하는 법 알려줘"
        ];

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-20">
                <div className="container max-w-4xl">
                    {/* Mascot Character Section */}
                    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
                        {/* Character Image */}
                        <div className="relative animate-in zoom-in duration-500 delay-100">
                            <div className="absolute inset-0 bg-indigo-400/20 dark:bg-indigo-600/20 blur-3xl rounded-full animate-pulse"></div>
                            <img
                                src="/images/mascot-guide.png"
                                alt="Search Guide Mascot"
                                className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-2xl"
                            />
                        </div>

                        {/* Speech Bubble */}
                        <div className="relative animate-in slide-in-from-bottom duration-500 delay-300">
                            <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border-4 border-indigo-500 dark:border-indigo-600 p-8 max-w-2xl relative">
                                {/* Speech Bubble Arrow */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[24px] border-b-indigo-500 dark:border-b-indigo-600"></div>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-white dark:border-b-zinc-800"></div>

                                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                                    그냥 말하듯이 물어보세요!
                                </h2>
                                <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                    AI가 문장을 이해하고, 딱 맞는 결과를 찾아드려요. 🔍✨
                                </p>
                            </div>
                        </div>

                        {/* Example Query Buttons */}
                        <div className="w-full max-w-2xl animate-in slide-in-from-bottom duration-500 delay-500">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                                💡 이렇게 검색해보세요
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {exampleQueries.map((query, index) => (
                                    <Link
                                        key={index}
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        className="group relative overflow-hidden bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border-2 border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <p className="relative text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-left">
                                            &quot;{query}&quot;
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Additional Tip */}
                        <div className="animate-in fade-in duration-500 delay-700">
                            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 italic">
                                키워드 대신 문장으로 검색하면, 더 정확한 결과를 받을 수 있어요
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 1. AI Intent Analysis
    const intent = await analyzeSearchQuery(query);
    const searchTerms = [query, ...intent.keywords, ...intent.filters.tags].filter(Boolean);

    // 2. Fetch Unified Search Content
    // We match against Title, Description, Tags using the new SearchContent table
    const searchResults = await prisma.searchContent.findMany({
        where: {
            OR: searchTerms.map(term => ({
                OR: [
                    { title: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } },
                    { tags: { has: term } },
                    { keywords: { has: term } }
                ]
            })),
            isHidden: false
        },
        take: 50
    });

    // 3. Fetch Recommended Servers (Real Server Data for Banner)
    const recommendedServers = await prisma.server.findMany({
        // where: { isOnline: true }, // Removed to ensure servers show up even if offline in dev
        orderBy: { onlinePlayers: 'desc' },
        take: 4,
        include: { user: true, _count: { select: { votes: true } } }
    });

    // 4. Exact Match Server Check
    const exactMatchServer = await prisma.server.findFirst({
        where: {
            name: {
                equals: query,
                mode: 'insensitive'
            }
        },
        include: { _count: { select: { votes: true } } }
    });


    const calculateScore = (item: typeof searchResults[0]) => {
        // 1. Base Score (Grades + Views)
        let score = calculateBaseScore(item);

        // 2. Text Match Bonuses
        const queryLower = query.toLowerCase();

        // Title Match (+200)
        if (item.title.toLowerCase().includes(queryLower)) {
            score += BONUSES.KEYWORD_MATCH;
        }

        // Description or Tag Match (+50)
        // We allow this to stack with Title Match, as a document that matches everywhere is likely very relevant.
        const descMatch = item.description.toLowerCase().includes(queryLower);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(queryLower));

        if (descMatch || tagMatch) {
            score += BONUSES.DESC_OR_TAG_MATCH;
        }

        // 3. Intent Bonus (Category Match)
        if (intent.category === 'NAVIGATION' && item.type === 'SERVER') score += 200;
        if (intent.category === 'GUIDE' && item.type === 'WIKI') score += 100;
        if (intent.category === 'RESOURCE' && item.type === 'RESOURCE') score += 100;

        return score;
    };

    // Sort by Score
    const scoredResults = searchResults.map(item => ({
        ...item,
        score: calculateScore(item)
    })).sort((a, b) => b.score - a.score);

    // 4. Grouping for UI
    const navigationTarget = (intent.category === 'NAVIGATION' && scoredResults.length > 0)
        ? scoredResults[0] // Best match is the target
        : null;

    const wikis = scoredResults.filter(i => i.type === 'WIKI');
    const mainContent = scoredResults.filter(i => i.type === 'SERVER' || i.type === 'RESOURCE');
    const posts = scoredResults.filter(i => i.type === 'POST');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            {/* Header with AI Context */}
            <div className="bg-white dark:bg-zinc-900 border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Sparkles className="w-64 h-64 text-indigo-500" />
                </div>
                <div className="container py-8 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${intent.category === 'PROBLEM' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {intent.category} INTENT
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">&quot;{query}&quot; 검색 결과</h1>

                    {intent.explanation && (
                        <div className="flex items-start gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5 max-w-2xl">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg shrink-0">
                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{intent.explanation}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {intent.keywords.map(k => (
                                        <span key={k} className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-600">Key: {k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container py-8 space-y-12">

                {/* 0. EXACT MATCH (Highest Priority) */}
                {exactMatchServer && (
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">🌟 정확히 찾는 서버인가요? (Exact Match)</h2>
                        <ServerBannerCard server={exactMatchServer} size="lg" priority />
                    </section>
                )}

                {/* 0. Navigation Shortcut */}
                {navigationTarget && navigationTarget.type !== 'POST' && (
                    <NavigationShortcut target={navigationTarget} />
                )}

                {/* 1. Guides & Notices */}
                <WikiResultList wikis={wikis} />

                {/* 2. Resources & Servers (Unified) */}
                <ResourceResultList items={mainContent} />

                {/* 2.5 Recommended Servers (Wide Banner Style) */}
                {recommendedServers.length > 0 && (
                    <section className="bg-slate-50 dark:bg-black/20 -mx-4 px-4 py-8 md:rounded-2xl border-y border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-1.5 rounded-lg bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
                                <ServerIcon className="h-6 w-6" />
                            </span>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">🔥 핫한 서버 추천</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">지금 접속자가 가장 많은 인기 서버들을 만나보세요!</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recommendedServers.map((server) => (
                                <ServerBannerCard key={`rec-${server.id}`} server={server} size="md" />
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Related Posts */}
                <PostResultList posts={posts} />

                {scoredResults.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-dashed">
                        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                        <p className="text-sm text-muted-foreground mt-1">오타를 확인하거나 다른 검색어로 시도해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
