'use client';

import { useState } from 'react';
import { Sparkles, Download, Save, Loader2, AlertCircle, FileDown } from 'lucide-react';
import SkinCanvas from '@/components/SkinCanvas';
import SkinGallery from '@/components/SkinGallery';
import MarkdownExporter from '@/components/MarkdownExporter';
import { SavedSkin, resizeToMinecraftSkin, extractColorPalette } from '@/lib/huggingface';

export default function SkinGeneratorPage() {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSkin, setCurrentSkin] = useState<SavedSkin | null>(null);
    const [showMarkdownExport, setShowMarkdownExport] = useState(false);

    const examplePrompts = [
        '파란색 후드티를 입은 사이버펑크 고양이',
        '검은 갑옷을 입은 중세 기사',
        '빨간 마법사 로브를 입은 엔더맨',
        '레인보우 색상의 유니콘',
        '닌자 복장을 한 크리퍼',
        '우주복을 입은 스티브',
        '해적 선장 복장',
        '눈 내리는 겨울 의상',
    ];

    const generateSkin = async () => {
        if (!prompt.trim()) {
            setError('프롬프트를 입력해주세요');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/skin-generator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '생성 실패');
            }

            // Resize to 64x64
            const resized = await resizeToMinecraftSkin(data.imageUrl);
            setGeneratedImage(resized);
            setIsEditing(false);
            setCurrentSkin(null);

        } catch (err: any) {
            setError(err.message || '알 수 없는 오류가 발생했습니다');
        } finally {
            setIsGenerating(false);
        }
    };

    const saveSkin = async () => {
        if (!generatedImage) return;

        const title = prompt || '제목 없음';
        const colors = await extractColorPalette(generatedImage);

        const skin: SavedSkin = {
            id: Date.now().toString(),
            title,
            prompt,
            imageData: generatedImage,
            colors,
            createdAt: new Date().toISOString(),
        };

        // Save to localStorage
        const existing = localStorage.getItem('minecraftSkins');
        const skins = existing ? JSON.parse(existing) : [];
        skins.unshift(skin);

        // Limit to 50 skins
        if (skins.length > 50) {
            skins.pop();
        }

        localStorage.setItem('minecraftSkins', JSON.stringify(skins));

        setCurrentSkin(skin);
        alert('스킨이 저장되었습니다!');
    };

    const downloadPNG = () => {
        if (!generatedImage) return;

        const a = document.createElement('a');
        a.href = generatedImage;
        a.download = `minecraft_skin_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadPackage = async () => {
        if (!generatedImage) return;

        // This would create a ZIP file with PNG + markdown
        // For simplicity, just download PNG for now
        downloadPNG();
        alert('현재 PNG 파일만 다운로드됩니다. ZIP 패키지는 추후 추가될 예정입니다.');
    };

    const handleEditSkin = (skin: SavedSkin) => {
        setGeneratedImage(skin.imageData);
        setPrompt(skin.prompt);
        setCurrentSkin(skin);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageChange = (newImageData: string) => {
        setGeneratedImage(newImageData);
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                </div>

                <div className="container relative py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                            <Sparkles className="h-4 w-4 text-purple-300" />
                            <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">AI Powered</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                            AI 마인크래프트 <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">스킨 생성기</span>
                        </h1>

                        <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                            상상하는 모든 스킨을 AI로 만들어보세요. <br />
                            텍스트만 입력하면 픽셀 아트 스킨이 완성됩니다!
                        </p>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4 -mt-8 relative z-10">
                {/* Main Generation Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border p-6 md:p-8 mb-12">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left: Input */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="h-6 w-6 text-purple-500" />
                                    스킨 생성하기
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            어떤 스킨을 만들고 싶나요?
                                        </label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="예: 파란색 후드티를 입은 사이버펑크 고양이"
                                            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            rows={4}
                                            disabled={isGenerating}
                                        />
                                    </div>

                                    <button
                                        onClick={generateSkin}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                생성 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                AI로 생성하기
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-900 dark:text-red-100">오류 발생</p>
                                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Example Prompts */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">💡 예시 프롬프트</h3>
                                <div className="flex flex-wrap gap-2">
                                    {examplePrompts.map((example, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(example)}
                                            className="text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Preview & Editor */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">
                                    {isEditing ? '스킨 편집' : '미리보기'}
                                </h3>
                                {generatedImage && (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-sm font-medium text-purple-500 hover:text-purple-600"
                                    >
                                        {isEditing ? '편집 완료' : '편집하기'}
                                    </button>
                                )}
                            </div>

                            <SkinCanvas
                                imageData={generatedImage}
                                onImageChange={handleImageChange}
                                editable={isEditing}
                            />

                            {/* Action Buttons */}
                            {generatedImage && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={downloadPNG}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        PNG 다운로드
                                    </button>

                                    <button
                                        onClick={saveSkin}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Save className="h-4 w-4" />
                                        저장하기
                                    </button>

                                    {currentSkin && (
                                        <button
                                            onClick={() => setShowMarkdownExport(!showMarkdownExport)}
                                            className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            <FileDown className="h-4 w-4" />
                                            마크다운 내보내기
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Markdown Export Section */}
                    {showMarkdownExport && currentSkin && (
                        <div className="mt-8 pt-8 border-t">
                            <h3 className="font-bold text-xl mb-4">마크다운 내보내기</h3>
                            <MarkdownExporter skin={currentSkin} />
                        </div>
                    )}
                </div>

                {/* Gallery Section */}
                <div className="mb-12">
                    <SkinGallery
                        onSelectSkin={(skin) => {
                            setGeneratedImage(skin.imageData);
                            setPrompt(skin.prompt);
                            setCurrentSkin(skin);
                            setShowMarkdownExport(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onEditSkin={handleEditSkin}
                    />
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-8 border">
                    <h3 className="text-2xl font-bold mb-6 text-center">🎮 사용 방법</h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                            <h4 className="font-bold mb-2">프롬프트 입력</h4>
                            <p className="text-sm text-muted-foreground">원하는 스킨을 자유롭게 설명해주세요</p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                            <h4 className="font-bold mb-2">AI 생성 & 편집</h4>
                            <p className="text-sm text-muted-foreground">AI가 생성한 후 픽셀 단위로 편집하세요</p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                            <h4 className="font-bold mb-2">다운로드 & 공유</h4>
                            <p className="text-sm text-muted-foreground">PNG로 저장하거나 커뮤니티에 공유하세요</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
