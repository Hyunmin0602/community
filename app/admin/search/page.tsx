import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, TrendingUp, MousePointerClick, AlertCircle, BarChart } from 'lucide-react';
import { calculateBaseScore } from '@/lib/search-score';
import SearchDiagnostics from '@/components/admin/SearchDiagnostics';


export const dynamic = 'force-dynamic';

export default async function AdminSearchDashboard() {
    // 1. Overview Stats
    const totalSearches = await prisma.searchQueryLog.count();

    // Calculate Average CTR (Approximate from content clicks)
    const totalClicks = await prisma.searchContent.aggregate({
        _sum: { clicks: true, impressions: true }
    });

    const avgCtr = totalClicks._sum.impressions ? ((totalClicks._sum.clicks || 0) / (totalClicks._sum.impressions || 1) * 100).toFixed(2) : '0';

    // 2. Recent Queries
    const recentQueries = await prisma.searchQueryLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });

    // 3. Top Keywords (Group by Query)
    // Prisma doesn't support groupBy with count on String field easily in all versions or simple findMany,
    // but we can use groupBy.
    const topKeywords = await prisma.searchQueryLog.groupBy({
        by: ['query'],
        _count: {
            query: true
        },
        orderBy: {
            _count: {
                query: 'desc'
            }
        },
        take: 10
    });

    // 4. Low Click Content (High Impressions, Low Clicks) -> Potential Spam or Bad Titles
    const lowQualityContent = await prisma.searchContent.findMany({
        where: {
            impressions: { gt: 10 },
        },
        orderBy: {
            clicks: 'asc' // Low clicks first
        },
        take: 5
    });

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold mb-6">🔍 검색 엔진 현황</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Search className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">총 검색 횟수</p>
                            <h3 className="text-2xl font-bold">{totalSearches.toLocaleString()}</h3>
                        </div>
                        <div className="ml-auto flex items-center text-green-500 text-xs font-bold gap-1">
                            <TrendingUp className="h-4 w-4" /> Live
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <MousePointerClick className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">평균 클릭률 (CTR)</p>
                            <h3 className="text-2xl font-bold">{avgCtr}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">무응답 검색어</p>
                            {/* This would require complex query, placeholder */}
                            <h3 className="text-2xl font-bold">-</h3>
                        </div>
                        <p className="ml-auto text-xs text-muted-foreground">집계 중</p>
                    </div>
                </div>
            </div>

            {/* Diagnostics Tool */}
            <SearchDiagnostics />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Keywords */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">🔥 인기 검색어 (Top 10)</h3>
                    <div className="space-y-4">
                        {topKeywords.map((group: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                                <span className="font-medium text-lg text-slate-700 dark:text-slate-200">
                                    {idx + 1}. {group.query}
                                </span>
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded">
                                    {group._count.query}회
                                </span>
                            </div>
                        ))}
                        {topKeywords.length === 0 && <p className="text-muted-foreground">데이터가 없습니다.</p>}
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">⏱️ 실시간 검색 로그</h3>
                    <div className="space-y-3">
                        {recentQueries.map((log: any) => (
                            <div key={log.id} className="flex flex-col p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg text-sm border-l-4 border-slate-300">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        &quot;{log.query}&quot;
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(log.createdAt, { addSuffix: true, locale: ko })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>결과 {log.resultCount}개</span>
                                    <span>User: {log.userId ? '회원' : '비회원'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Low Quality Content */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold mb-4">⚠️ 클릭률 저조 콘텐츠 (개선 필요)</h3>
                <p className="text-sm text-muted-foreground mb-4">노출은 많이 되지만 클릭이 적은 콘텐츠입니다. 썸네일이나 제목 변경을 고려하세요.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">제목</th>
                                <th className="px-4 py-3">타입</th>
                                <th className="px-4 py-3">노출수</th>
                                <th className="px-4 py-3">클릭수</th>
                                <th className="px-4 py-3 rounded-tr-lg">CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowQualityContent.map((item) => {
                                const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={item.id} className="border-b dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-4 py-3 font-medium truncate max-w-xs">{item.title}</td>
                                        <td className="px-4 py-3 text-xs">{item.type}</td>
                                        <td className="px-4 py-3">{item.impressions}</td>
                                        <td className="px-4 py-3">{item.clicks}</td>
                                        <td className="px-4 py-3 font-bold text-red-500">{ctr}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* All Content Scores */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold">📊 전체 콘텐츠 가중치 현황 (Top 50)</h3>
                        <p className="text-sm text-muted-foreground">알고리즘에 의해 계산된 현재 기준 총점입니다. (신뢰도 + 정확도 + 인기 + 최신성 - 신고)</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart className="h-4 w-4" />
                        <span>점수순 정렬</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">순위</th>
                                <th className="px-4 py-3">제목</th>
                                <th className="px-4 py-3">타입</th>
                                <th className="px-4 py-3 text-right">조회/좋아요</th>
                                <th className="px-4 py-3 text-right">클릭/노출 (CTR)</th>
                                <th className="px-4 py-3 text-right text-indigo-600 font-bold rounded-tr-lg">총점 (Score)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {await (async () => {
                                const allContent = await prisma.searchContent.findMany({
                                    take: 50,
                                    // 1차적으로 최신순으로 가져온 뒤 점수로 재정렬 (또는 전체를 다 가져와서 점수 정렬하기엔 많을 수 있음. 
                                    // 일단 최신 100개 중 점수 높은 순으로 보여주거나, viewCount로 정렬해 가져오는 전략 등 고민.
                                    // 여기서는 '가중치 관리'니까 viewCount 높은 순으로 50개 가져와서 점수 보여주는게 유의미할 듯.
                                    orderBy: { viewCount: 'desc' }
                                });

                                const scoredContent = allContent.map(item => ({
                                    ...item,
                                    score: calculateBaseScore(item)
                                })).sort((a, b) => b.score - a.score);

                                return scoredContent.map((item, idx) => {
                                    const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={item.id} className="border-b dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium truncate max-w-xs">{item.title}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.type === 'SERVER' ? 'bg-blue-100 text-blue-700' :
                                                    item.type === 'RESOURCE' ? 'bg-green-100 text-green-700' :
                                                        item.type === 'WIKI' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col">
                                                    <span>👁️ {item.viewCount}</span>
                                                    <span className="text-xs text-muted-foreground">❤️ {item.likeCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col">
                                                    <span>🖱️ {item.clicks} / {item.impressions}</span>
                                                    <span className="text-xs font-bold text-blue-500">{ctr}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {item.score}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
}
