'use client';

import { useState } from 'react';
import { runSearchDiagnostics } from '@/app/admin/search/actions';
import { SearchResponse } from '@/lib/search-service';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function SearchDiagnostics() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await runSearchDiagnostics(query);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('진단 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-1">🛠️ 검색 로직 정밀 진단</h3>
                <p className="text-sm text-muted-foreground">
                    특정 검색어에 대해 검색 엔진이 어떻게 의도를 분석하고 점수를 계산하는지 확인합니다.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="테스트할 검색어를 입력하세요 (예: 야생 서버, 건축 강좌)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '진단 실행'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Intent Analysis Result */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">AI 의도 분석 결과</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Category</span>
                                <span className={`font-mono font-bold ${result.intent.category === 'GENERAL' ? 'text-slate-500' : 'text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                    {result.intent.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Explanation</span>
                                <span>{result.intent.explanation || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-muted-foreground block text-xs mb-1">Applied Search Terms (Expanded)</span>
                                <div className="flex flex-wrap gap-1">
                                    {result.searchTerms.map((term, i) => (
                                        <span key={i} className={`px-1.5 py-0.5 rounded text-xs ${term === query ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {term}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                검색 결과 ({result.results.length}건)
                            </h4>
                            <span className="text-xs text-muted-foreground">총점 내림차순 정렬</span>
                        </div>

                        <div className="overflow-x-auto border rounded-lg dark:border-zinc-800">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 w-10">#</th>
                                        <th className="px-3 py-2">Content</th>
                                        <th className="px-3 py-2 text-right">Base</th>
                                        <th className="px-3 py-2 text-right">Text</th>
                                        <th className="px-3 py-2 text-right">Intent</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-zinc-800">
                                    {result.results.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                                            <td className="px-3 py-2">
                                                <div className="font-medium truncate max-w-[200px]">{item.title}</div>
                                                <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                    <span className="uppercase">{item.type}</span>
                                                    <span>👁️ {item.viewCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-slate-500">
                                                {item.scoreBreakdown.base}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-blue-500">
                                                {item.scoreBreakdown.keywordMatch + item.scoreBreakdown.descOrTagMatch > 0
                                                    ? `+${item.scoreBreakdown.keywordMatch + item.scoreBreakdown.descOrTagMatch}`
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-purple-500">
                                                {item.scoreBreakdown.intentBonus > 0 ? `+${item.scoreBreakdown.intentBonus}` : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold bg-indigo-50/30 dark:bg-indigo-900/10">
                                                {item.score}
                                            </td>
                                        </tr>
                                    ))}
                                    {result.results.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                                                검색 결과가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
