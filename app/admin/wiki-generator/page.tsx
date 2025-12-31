'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { Loader2, Wand2, Save, Link as LinkIcon, FileText } from 'lucide-react';
import { marked } from 'marked';
import { WikiCategory } from '@prisma/client';

export default function WikiGeneratorPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'URL' | 'TEXT'>('URL');
    const [inputUrl, setInputUrl] = useState('');
    const [inputText, setInputText] = useState('');

    // Generated Data
    const [result, setResult] = useState<{
        title: string;
        content: string;
        excerpt: string;
        category: WikiCategory;
    } | null>(null);

    const handleGenerate = async () => {
        if (mode === 'URL' && !inputUrl) {
            alert('URL을 입력해주세요.');
            return;
        }
        if (mode === 'TEXT' && !inputText) {
            alert('텍스트를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/wiki/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: mode === 'URL' ? inputUrl : undefined,
                    text: mode === 'TEXT' ? inputText : undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '생성 실패');
            }

            const data = await res.json();

            // Markdown -> HTML 변환
            const htmlContent = await marked.parse(data.content || '');

            setResult({
                title: data.title,
                content: htmlContent, // 변환된 HTML 저장
                excerpt: data.excerpt,
                category: data.category || 'GUIDE',
            });
        } catch (error: any) {
            console.error(error);
            alert(`오류 발생: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        try {
            // Slug 생성 (간단히 제목 기반으로)
            const slug = Math.random().toString(36).substring(2, 10); // 임시 랜덤 슬러그

            const res = await fetch('/api/wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...result,
                    slug,
                    sourceUrl: inputUrl,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '저장 실패');
            }

            const savedDoc = await res.json();
            alert('저장되었습니다!');
            router.push(`/wiki/${savedDoc.slug}`);
        } catch (error: any) {
            alert(`저장 실패: ${error.message}`);
        }
    };

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex items-center gap-3 border-b pb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Wand2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">AI 위키 생성기</h1>
                    <p className="text-muted-foreground">URL이나 텍스트를 입력하면 Gemini가 자동으로 위키 문서를 만들어줍니다.</p>
                </div>
            </div>

            {/* Input Section */}
            <div className="card p-6 space-y-4">
                <div className="flex gap-4 border-b pb-4">
                    <button
                        onClick={() => setMode('URL')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${mode === 'URL' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                    >
                        <LinkIcon className="h-4 w-4" /> URL로 가져오기
                    </button>
                    <button
                        onClick={() => setMode('TEXT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${mode === 'TEXT' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                    >
                        <FileText className="h-4 w-4" /> 텍스트 직접 입력
                    </button>
                </div>

                {mode === 'URL' ? (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">참고할 URL (여러 개 가능)</label>
                        <textarea
                            placeholder="https://minecraft.wiki/...\nhttps://www.minecraft.net/..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border bg-background min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">줄바꿈으로 여러 주소를 입력하면 AI가 내용을 모두 읽고 하나로 합쳐줍니다.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">원본 텍스트</label>
                        <textarea
                            rows={8}
                            placeholder="번역/요약할 내용을 붙여넣으세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border bg-background"
                        />
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Gemini가 분석 중입니다...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-5 w-5" />
                            AI로 문서 생성하기
                        </>
                    )}
                </button>
            </div>

            {/* Result Preview Section */}
            {result && (
                <div className="card p-6 space-y-6 border-2 border-purple-100 dark:border-purple-900/50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">생성 괼과 미리보기</h2>
                        <span className="text-sm px-2 py-1 bg-muted rounded">{result.category}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">제목</label>
                            <input
                                type="text"
                                value={result.title}
                                onChange={(e) => setResult({ ...result, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border bg-background font-bold"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">요약 (Excerpt)</label>
                            <input
                                type="text"
                                value={result.excerpt}
                                onChange={(e) => setResult({ ...result, excerpt: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">내용 (Markdown)</label>
                            <RichTextEditor
                                value={result.content}
                                onChange={(val) => setResult({ ...result, content: val })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => setResult(null)}
                            className="px-4 py-2 rounded-lg hover:bg-muted"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            위키에 저장하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
