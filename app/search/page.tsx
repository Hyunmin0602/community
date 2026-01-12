import { prisma } from '@/lib/prisma';
import { performSearch } from '@/lib/search-service';
import { Sparkles, Server as ServerIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ContentType, Grade } from '@prisma/client';
import ServerBannerCard from '@/components/search/ServerBannerCard';
import ServerHero from '@/components/search/ServerHero';
import WikiResultList from '@/components/search/WikiResultList';
import PostResultList from '@/components/search/PostResultList';
import ResourceResultList from '@/components/search/ResourceResultList';
import ServerResultList from '@/components/search/ServerResultList';
import NavigationShortcut from '@/components/search/NavigationShortcut';
import SearchAnalytics from '@/components/search/SearchAnalytics';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string; sort?: string; filter?: string };
}) {
    const query = searchParams.q || '';
    const sortBy = (searchParams.sort === 'POPULARITY' || searchParams.sort === 'LATEST') ? searchParams.sort : 'RELEVANCE';

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

    // 1. Unified Search (AI Intent + DB + Scoring)
    const { intent, results: scoredResults, searchTerms } = await performSearch(query, sortBy);

    // 2.5 Log Search Query (Async, Fire-and-forget style if possible, but await for safety)
    try {
        const session = await getServerSession(authOptions);
        // We log async without blocking rendering too much? 
        // Ideally use a queue, but here we await fast DB write.
        // Or dont await? Next.js server actions might cancel promises if response returns.
        // Let's await to be safe.
        await prisma.searchQueryLog.create({
            data: {
                query,
                userId: session?.user?.id,
                resultCount: scoredResults.length,
            }
        });
    } catch (e) {
        console.error("Failed to log search query", e);
    }

    // 3. Fetch Recommended Servers (Real Server Data for Banner)
    const hotServers = await prisma.server.findMany({
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




    // 4. Grouping for UI
    const navigationTarget = (intent.category === 'NAVIGATION' && scoredResults.length > 0)
        ? scoredResults[0] // Best match is the target
        : null;

    // Detect Best Match Server (for Custom Banner)
    let bestMatchServer = null;
    const topResult = scoredResults[0];

    // If top result is a server, highlight it!
    if (topResult && topResult.type === 'SERVER' && topResult.serverId) {
        bestMatchServer = await prisma.server.findUnique({
            where: { id: topResult.serverId },
            include: { _count: { select: { votes: true } } }
        });
    }

    // 4.1 Categorization Logic
    const wikis = scoredResults.filter(i => i.type === 'WIKI');

    const recommendedServers = scoredResults.filter(i => {
        if (bestMatchServer && i.id === topResult.id) return false;
        return i.type === 'SERVER';
    });

    // Helper to check tags case-insensitively
    const hasTag = (item: any, tagList: string[]) => {
        return item.tags?.some((t: string) => tagList.some(target => t.toLowerCase().includes(target.toLowerCase())));
    };

    const recommendedMods = scoredResults.filter(i => i.type === 'RESOURCE' && hasTag(i, ['모드', 'Mod', 'Mode', 'Optimization']));
    const recommendedMaps = scoredResults.filter(i => i.type === 'RESOURCE' && hasTag(i, ['맵', 'Map', 'World', 'Savefile', '탈출맵']));
    const recommendedTextures = scoredResults.filter(i => i.type === 'RESOURCE' && hasTag(i, ['텍스쳐', 'Texture', 'Resource Pack', '리소스']));

    // Items that didn't fall into the above specific categories
    const otherResources = scoredResults.filter(i => {
        if (i.type !== 'RESOURCE') return false;
        if (hasTag(i, ['모드', 'Mod', 'Mode', 'Optimization'])) return false;
        if (hasTag(i, ['맵', 'Map', 'World', 'Savefile', '탈출맵'])) return false;
        if (hasTag(i, ['텍스쳐', 'Texture', 'Resource Pack', '리소스'])) return false;
        return true;
    });

    const posts = scoredResults.filter(i => i.type === 'POST');

    // 5. Dynamic Layout Ordering
    const sectionComponents: Record<string, React.ReactNode> = {
        'WIKI': wikis.length > 0 ? (
            <WikiResultList wikis={wikis} />
        ) : null,

        'SERVER_HERO': (bestMatchServer && !exactMatchServer) ? (
            <section className="animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        ✨ 맞춤 추천 서버
                    </h2>
                </div>
                <ServerHero server={bestMatchServer} />
            </section>
        ) : null,

        'HOT_SERVERS': hotServers.length > 0 ? (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotServers.map((server) => (
                        <ServerHero key={`rec-${server.id}`} server={server} />
                    ))}
                </div>
            </section>
        ) : null,

        'RECOMMENDED_CONTENT': (recommendedServers.length > 0 || recommendedMods.length > 0 || recommendedMaps.length > 0 || recommendedTextures.length > 0 || otherResources.length > 0) ? (
            <section className="animate-in slide-in-from-bottom duration-500 delay-100 space-y-6">

                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        📚 추천 콘텐츠
                    </h2>
                </div>

                {/* Sub Categories for Resources (If intent is RESOURCE) */}
                {intent.category === 'RESOURCE' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {/* Badges for Sub Filters */}
                        {['NEWS', 'MODS', 'MAPS', 'PLUGINS', 'SCRIPTS', 'DEV_QUESTION'].map(filter => (
                            <Link
                                key={filter}
                                href={`/search?q=${encodeURIComponent(query)}&filter=${filter}`}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${(intent.subCategory === filter) // Highlight if matches intent
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700'
                                    }`}
                            >
                                {filter === 'NEWS' && '📰 소식'}
                                {filter === 'MODS' && '🔧 모드'}
                                {filter === 'MAPS' && '🗺️ 맵'}
                                {filter === 'PLUGINS' && '🔌 플러그인'}
                                {filter === 'SCRIPTS' && '📜 스크립트'}
                                {filter === 'DEV_QUESTION' && '💻 개발질문'}
                            </Link>
                        ))}
                    </div>
                )}

                {recommendedServers.length > 0 && (
                    <div className="pl-1">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            🖥️ 서버
                        </h3>
                        {/* Banner Layout for Servers */}
                        <ServerResultList items={recommendedServers} />
                    </div>
                )}

                {recommendedMods.length > 0 && (
                    <div className="pl-1">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            🔧 모드
                        </h3>
                        <ResourceResultList items={recommendedMods} />
                    </div>
                )}

                {recommendedMaps.length > 0 && (
                    <div className="pl-1">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            🗺️ 맵
                        </h3>
                        <ResourceResultList items={recommendedMaps} />
                    </div>
                )}

                {recommendedTextures.length > 0 && (
                    <div className="pl-1">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            🎨 텍스쳐
                        </h3>
                        <ResourceResultList items={recommendedTextures} />
                    </div>
                )}

                {otherResources.length > 0 && (
                    <div className="pl-1">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            📦 기타
                        </h3>
                        <ResourceResultList items={otherResources} />
                    </div>
                )}
            </section>
        ) : null,

        'POSTS': posts.length > 0 ? (
            <PostResultList posts={posts} />
        ) : null,
    };

    // Define Layout Priority based on Intent
    // Initial Layout: WIKI -> HERO -> [RECOMMENDED_CONTENT] -> HOT -> POSTS
    let layoutOrder = ['WIKI', 'SERVER_HERO', 'RECOMMENDED_CONTENT', 'HOT_SERVERS', 'POSTS'];

    if (intent.category === 'SERVER') {
        // Servers First!
        layoutOrder = ['SERVER_HERO', 'RECOMMENDED_CONTENT', 'HOT_SERVERS', 'WIKI', 'POSTS'];
    } else if (intent.category === 'GUIDE' || intent.category === 'PROBLEM') {
        // Information First!
        layoutOrder = ['WIKI', 'POSTS', 'RECOMMENDED_CONTENT', 'SERVER_HERO', 'HOT_SERVERS'];
    } else if (intent.category === 'RESOURCE') {
        // Downloads First!
        layoutOrder = ['RECOMMENDED_CONTENT', 'WIKI', 'SERVER_HERO', 'POSTS', 'HOT_SERVERS'];
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            <SearchAnalytics query={query} />
            {/* Header with AI Context */}
            <div className="bg-white dark:bg-zinc-900 border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Sparkles className="w-64 h-64 text-indigo-500" />
                </div>
                <div className="container py-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${intent.category === 'PROBLEM' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                    {intent.category} INTENT
                                </span>
                                {intent.subCategory && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
                                        {intent.subCategory}
                                    </span>
                                )}
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

                        {/* Sorting Controls */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}&sort=RELEVANCE`}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'RELEVANCE'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                정확도순
                            </Link>
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}&sort=POPULARITY`}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'POPULARITY'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                🔥 인기순
                            </Link>
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}&sort=LATEST`}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'LATEST'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                ✨ 최신순
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8 space-y-8">

                {/* 0. ALWAYS TOP: EXACT MATCH & NAVIGATION (Highest Priority) */}
                {exactMatchServer && (
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">🌟 정확히 찾는 서버인가요? (Exact Match)</h2>
                        <ServerHero server={exactMatchServer} />
                    </section>
                )}

                {navigationTarget && navigationTarget.type !== 'POST' && (
                    <NavigationShortcut target={navigationTarget} />
                )}

                {/* 1. DYNAMIC SECTIONS */}
                {layoutOrder.map(key => {
                    const component = sectionComponents[key];
                    if (!component) return null;
                    return <div key={key}>{component}</div>;
                })}

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
