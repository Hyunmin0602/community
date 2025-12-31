'use client';

import { useState } from 'react';
import { Grade, SearchContent } from '@prisma/client';
import { Calculator, Shield, Target, Award, ArrowLeft, AlertCircle, CheckCircle2, List, RefreshCw, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { calculateBaseScore, GRADE_SCORES, WEIGHTS, BONUSES, RECENCY_WINDOW_DAYS } from '@/lib/search-score';
import { useRouter } from 'next/navigation';

interface SearchManagementClientProps {
    initialContent: SearchContent[];
}

export default function SearchManagementClient({ initialContent }: SearchManagementClientProps) {
    const router = useRouter();
    const [trust, setTrust] = useState<Grade>('B');
    const [relevance, setRelevance] = useState<Grade>('B');
    const [accuracy, setAccuracy] = useState<Grade>('B');
    const [keywordMatch, setKeywordMatch] = useState(true);
    const [descMatch, setDescMatch] = useState(false); // New state
    const [isRecent, setIsRecent] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [categoryMatch, setCategoryMatch] = useState(false);

    // Inspector State
    const [contentList, setContentList] = useState(initialContent);
    const [searchTerm, setSearchTerm] = useState('');

    const handleRefresh = () => {
        router.refresh();
    };

    // Calculate Simulation Score
    const simulateScore = () => {
        let score = 0;
        score += (GRADE_SCORES[trust] || 0) * WEIGHTS.TRUST;
        score += (GRADE_SCORES[relevance] || 0) * WEIGHTS.RELEVANCE;
        score += (GRADE_SCORES[accuracy] || 0) * WEIGHTS.ACCURACY;

        if (keywordMatch) score += BONUSES.KEYWORD_MATCH;
        if (descMatch) score += BONUSES.DESC_OR_TAG_MATCH;
        if (isRecent) score += BONUSES.RECENCY;
        if (categoryMatch) score += 200;

        if (viewCount > 0) {
            score += Math.min(Math.log10(viewCount) * 10, 50);
        }
        return Math.round(score);
    };

    const simulationScore = simulateScore();

    // Filter Content List
    const filteredContent = contentList.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            관리자 홈으로
                        </Link>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            검색 가중치 시스템 관리
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            검색 엔진의 우선순위 로직을 확인하고 점수를 시뮬레이션합니다.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* 1. Simulator */}
                    <div className="card bg-white dark:bg-zinc-900 border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                            <Calculator className="h-6 w-6 text-indigo-500" />
                            <h2 className="text-xl font-bold">점수 시뮬레이터</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Grades Input */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-2 flex items-center gap-1 uppercase tracking-wider text-blue-600">
                                        Trust (x{WEIGHTS.TRUST})
                                    </label>
                                    <select
                                        value={trust}
                                        onChange={(e) => setTrust(e.target.value as Grade)}
                                        className="w-full p-2 rounded border bg-slate-50 dark:bg-zinc-800"
                                    >
                                        <option value="S">S (Official)</option>
                                        <option value="A">A (Verified)</option>
                                        <option value="B">B (General)</option>
                                        <option value="C">C (Low)</option>
                                        <option value="F">F (Spam)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 flex items-center gap-1 uppercase tracking-wider text-orange-600">
                                        Relevance (x{WEIGHTS.RELEVANCE})
                                    </label>
                                    <select
                                        value={relevance}
                                        onChange={(e) => setRelevance(e.target.value as Grade)}
                                        className="w-full p-2 rounded border bg-slate-50 dark:bg-zinc-800"
                                    >
                                        <option value="S">S (Target)</option>
                                        <option value="A">A (High)</option>
                                        <option value="B">B (General)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 flex items-center gap-1 uppercase tracking-wider text-green-600">
                                        Accuracy (x{WEIGHTS.ACCURACY})
                                    </label>
                                    <select
                                        value={accuracy}
                                        onChange={(e) => setAccuracy(e.target.value as Grade)}
                                        className="w-full p-2 rounded border bg-slate-50 dark:bg-zinc-800"
                                    >
                                        <option value="S">S (Perfect)</option>
                                        <option value="A">A (High)</option>
                                        <option value="B">B (Normal)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Additional Factors */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">검색어 포함 (Keyword Match, +{BONUSES.KEYWORD_MATCH})</label>
                                    <input
                                        type="checkbox"
                                        checked={keywordMatch}
                                        onChange={(e) => setKeywordMatch(e.target.checked)}
                                        className="toggle"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">내용/태그 포함 (Desc Match, +{BONUSES.DESC_OR_TAG_MATCH})</label>
                                    <input
                                        type="checkbox"
                                        checked={descMatch}
                                        onChange={(e) => setDescMatch(e.target.checked)}
                                        className="toggle"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">최신 글 (Recent &lt; 7 days, +{BONUSES.RECENCY})</label>
                                    <input
                                        type="checkbox"
                                        checked={isRecent}
                                        onChange={(e) => setIsRecent(e.target.checked)}
                                        className="toggle"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">카테고리 일치 (Intent Match, +200)</label>
                                    <input
                                        type="checkbox"
                                        checked={categoryMatch}
                                        onChange={(e) => setCategoryMatch(e.target.checked)}
                                        className="toggle"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">조회수 (Log Scale)</label>
                                    <input
                                        type="number"
                                        value={viewCount}
                                        onChange={(e) => setViewCount(Number(e.target.value))}
                                        className="w-full p-2 rounded border bg-slate-50 dark:bg-zinc-800"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Result */}
                            <div className="bg-slate-100 dark:bg-zinc-950 p-6 rounded-xl text-center border-2 border-indigo-500/20">
                                <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Score</span>
                                <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                                    {simulationScore}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Weight Table */}
                    <div className="space-y-6">
                        <div className="card bg-white dark:bg-zinc-900 border p-6 rounded-xl shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="h-6 w-6 text-purple-500" />
                                <h2 className="text-xl font-bold">가중치 정책 (Weight Logic)</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-zinc-800 uppercase text-xs font-bold text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Metric</th>
                                            <th className="px-4 py-3">Multiplier / Bonus</th>
                                            <th className="px-4 py-3">Priority Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-blue-600">Trust Grade</td>
                                            <td className="px-4 py-3 font-mono">x {WEIGHTS.TRUST.toFixed(1)}</td>
                                            <td className="px-4 py-3">운영진의 판단, 공식 여부 (최우선)</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-orange-600">Relevance Grade</td>
                                            <td className="px-4 py-3 font-mono">x {WEIGHTS.RELEVANCE.toFixed(1)}</td>
                                            <td className="px-4 py-3">콘텐츠의 역할 (공지, 가이드 등)</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-green-600">Accuracy Grade</td>
                                            <td className="px-4 py-3 font-mono">x {WEIGHTS.ACCURACY.toFixed(1)}</td>
                                            <td className="px-4 py-3">정보의 정확성, 최신성</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-indigo-600">Keyword Match</td>
                                            <td className="px-4 py-3 font-mono">+{BONUSES.KEYWORD_MATCH}</td>
                                            <td className="px-4 py-3">제목에 검색어 포함</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-pink-600">Recency Bonus</td>
                                            <td className="px-4 py-3 font-mono">+{BONUSES.RECENCY}</td>
                                            <td className="px-4 py-3">7일 이내 작성된 글</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-sm">정책 반영 안내</h4>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                        가중치 로직은 <code>lib/search-score.ts</code>에서 관리됩니다.
                                        시뮬레이터와 실제 검색 엔진은 동일한 로직을 공유합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Real-time Inspector */}
                <div className="card bg-white dark:bg-zinc-900 border overflow-hidden rounded-xl shadow-sm">
                    <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <List className="h-6 w-6 text-slate-500" />
                            <div>
                                <h2 className="text-xl font-bold">실시간 가중치 검사기</h2>
                                <p className="text-sm text-muted-foreground">실제 DB 데이터의 현재 점수를 확인합니다.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="제목 또는 타입 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2 text-sm">
                                <RefreshCw className="h-4 w-4" />
                                데이터 새로고침
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-zinc-800 uppercase text-xs font-bold text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3 text-center">Trust (x{WEIGHTS.TRUST})</th>
                                    <th className="px-6 py-3 text-center">Relev (x{WEIGHTS.RELEVANCE})</th>
                                    <th className="px-6 py-3 text-right">Base</th>
                                    <th className="px-6 py-3 text-right text-indigo-600">+Keyword</th>
                                    <th className="px-6 py-3 text-right text-teal-600">+Desc</th>
                                    <th className="px-6 py-3 text-right text-pink-600">+Recent</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredContent.map((item) => {
                                    const baseScore = calculateBaseScore(item);

                                    // Calculate dynamic bonuses
                                    let keywordBonus = 0;
                                    let descBonus = 0;

                                    if (searchTerm) {
                                        const queryLower = searchTerm.toLowerCase();
                                        if (item.title.toLowerCase().includes(queryLower)) {
                                            keywordBonus += BONUSES.KEYWORD_MATCH;
                                        }

                                        const descMatch = item.description.toLowerCase().includes(queryLower);
                                        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(queryLower));
                                        if (descMatch || tagMatch) {
                                            descBonus += BONUSES.DESC_OR_TAG_MATCH;
                                        }
                                    }

                                    // Base score display preparation
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - new Date(item.createdAt).getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const isRecent = diffDays <= RECENCY_WINDOW_DAYS;
                                    const recencyBonus = isRecent ? BONUSES.RECENCY : 0;
                                    const pureBaseScore = baseScore - recencyBonus;

                                    const totalScore = baseScore + keywordBonus + descBonus;

                                    let scoreColor = 'text-slate-600';
                                    if (totalScore >= 400) scoreColor = 'text-purple-600 font-black';
                                    else if (totalScore >= 300) scoreColor = 'text-indigo-600 font-bold';
                                    else if (totalScore >= 200) scoreColor = 'text-blue-600 font-bold';

                                    const isHighlight = keywordBonus > 0 || descBonus > 0;

                                    return (
                                        <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${isHighlight ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded text-slate-500">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium max-w-xs truncate" title={item.title}>
                                                {item.title}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${item.trustGrade === 'S' ? 'bg-blue-100 text-blue-700' :
                                                        item.trustGrade === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {item.trustGrade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${item.relevanceGrade === 'S' ? 'bg-orange-100 text-orange-700' :
                                                        item.relevanceGrade === 'A' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {item.relevanceGrade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">
                                                {pureBaseScore}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-indigo-600">
                                                {keywordBonus > 0 ? `+${keywordBonus}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-teal-600">
                                                {descBonus > 0 ? `+${descBonus}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-pink-600">
                                                {recencyBonus > 0 ? `+${recencyBonus}` : '-'}
                                                {recencyBonus > 0 && <span className="text-[10px] ml-1 text-slate-400">({diffDays}d)</span>}
                                            </td>
                                            <td className={`px-6 py-4 text-right text-lg ${scoreColor}`}>
                                                {totalScore}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={item.link} target="_blank" className="text-muted-foreground hover:text-indigo-500">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredContent.length === 0 && (
                            <div className="p-10 text-center text-muted-foreground">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
