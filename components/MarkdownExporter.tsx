'use client';

import { useState } from 'react';
import { FileDown, Copy, Check, FileText, ExternalLink } from 'lucide-react';
import { SavedSkin, generateSkinMarkdown } from '@/lib/huggingface';
import Link from 'next/link';

interface MarkdownExporterProps {
    skin: SavedSkin;
}

export default function MarkdownExporter({ skin }: MarkdownExporterProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);

    const markdown = generateSkinMarkdown(skin);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(markdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const downloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skin.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareToForum = () => {
        // Store skin data in localStorage for forum page to pick up
        localStorage.setItem('pendingSkinShare', JSON.stringify({
            title: skin.title,
            content: markdown,
            category: '커뮤니티'
        }));

        // Open forum page
        window.open('/forum?share=skin', '_blank');
    };

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors"
                >
                    <FileText className="h-4 w-4" />
                    {showPreview ? '미리보기 숨기기' : '미리보기'}
                </button>

                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? '복사됨!' : '마크다운 복사'}
                </button>

                <button
                    onClick={downloadMarkdown}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                    <FileDown className="h-4 w-4" />
                    .md 다운로드
                </button>

                <button
                    onClick={shareToForum}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    커뮤니티에 공유
                </button>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="border rounded-xl overflow-hidden">
                    {/* Preview Header */}
                    <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 border-b">
                        <h3 className="font-semibold text-sm">마크다운 미리보기</h3>
                    </div>

                    {/* Markdown Content */}
                    <div className="p-6 bg-white dark:bg-zinc-900 max-h-96 overflow-y-auto">
                        <div className="prose dark:prose-invert max-w-none">
                            <h1>{skin.title}</h1>

                            <img src={skin.imageData} alt={skin.title} className="w-64 h-64 mx-auto" style={{ imageRendering: 'pixelated' }} />

                            <h2>📝 생성 정보</h2>
                            <ul>
                                <li><strong>프롬프트</strong>: {skin.prompt}</li>
                                <li><strong>생성 날짜</strong>: {new Date(skin.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</li>
                                <li><strong>ID</strong>: <code>{skin.id}</code></li>
                            </ul>

                            <h2>🎨 색상 팔레트</h2>
                            <div className="flex flex-wrap gap-2">
                                {skin.colors.map((color, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded border-2 border-slate-300"
                                            style={{ backgroundColor: color }}
                                        />
                                        <code className="text-xs">{color}</code>
                                    </div>
                                ))}
                            </div>

                            <h2>💾 다운로드 및 사용</h2>
                            <ol>
                                <li>우클릭 &gt; 이미지 저장</li>
                                <li>Minecraft 실행</li>
                                <li>설정 &gt; 스킨 &gt; 파일 선택</li>
                                <li>저장한 이미지 선택</li>
                            </ol>

                            <hr />

                            <p className="text-sm text-muted-foreground italic">Generated by AI Skin Generator</p>
                        </div>
                    </div>

                    {/* Raw Markdown */}
                    <div className="border-t">
                        <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-sm">원본 마크다운</h3>
                            <button
                                onClick={copyToClipboard}
                                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                            >
                                {copied ? '✓ 복사됨' : '복사'}
                            </button>
                        </div>
                        <pre className="p-4 bg-slate-50 dark:bg-zinc-950 text-xs overflow-x-auto max-h-48">
                            <code>{markdown}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
