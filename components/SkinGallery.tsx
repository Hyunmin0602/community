'use client';

import { useState, useEffect } from 'react';
import { SavedSkin } from '@/lib/huggingface';
import { Trash2, Edit, Download } from 'lucide-react';

interface SkinGalleryProps {
    onSelectSkin?: (skin: SavedSkin) => void;
    onEditSkin?: (skin: SavedSkin) => void;
}

export default function SkinGallery({ onSelectSkin, onEditSkin }: SkinGalleryProps) {
    const [skins, setSkins] = useState<SavedSkin[]>([]);

    // Load skins from localStorage
    useEffect(() => {
        const loadSkins = () => {
            try {
                const stored = localStorage.getItem('minecraftSkins');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSkins(parsed);
                }
            } catch (error) {
                console.error('Failed to load skins:', error);
            }
        };

        loadSkins();

        // Listen for storage changes
        window.addEventListener('storage', loadSkins);
        return () => window.removeEventListener('storage', loadSkins);
    }, []);

    const deleteSkin = (id: string) => {
        const confirmed = confirm('이 스킨을 삭제하시겠습니까?');
        if (!confirmed) return;

        const updated = skins.filter(s => s.id !== id);
        setSkins(updated);
        localStorage.setItem('minecraftSkins', JSON.stringify(updated));
    };

    const downloadSkin = (skin: SavedSkin) => {
        // Convert data URL to blob and download
        fetch(skin.imageData)
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${skin.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
    };

    if (skins.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-dashed">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-bold text-lg mb-2">아직 저장된 스킨이 없습니다</h3>
                <p className="text-sm text-muted-foreground">AI로 스킨을 생성하고 저장해보세요!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">내 스킨 갤러리 ({skins.length}개)</h3>
                <button
                    onClick={() => {
                        const confirmed = confirm('모든 스킨을 삭제하시겠습니까?');
                        if (confirmed) {
                            setSkins([]);
                            localStorage.removeItem('minecraftSkins');
                        }
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                    모두 삭제
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {skins.map((skin) => (
                    <div
                        key={skin.id}
                        className="group relative bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        {/* Thumbnail */}
                        <div
                            className="aspect-square bg-slate-100 dark:bg-zinc-800 relative cursor-pointer"
                            onClick={() => onSelectSkin?.(skin)}
                        >
                            <img
                                src={skin.imageData}
                                alt={skin.title}
                                className="w-full h-full object-contain p-4"
                                style={{ imageRendering: 'pixelated' }}
                            />

                            {/* Hover overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {onEditSkin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditSkin(skin);
                                        }}
                                        className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                                        title="편집"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadSkin(skin);
                                    }}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    title="다운로드"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSkin(skin.id);
                                    }}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 border-t">
                            <h4 className="font-semibold text-sm truncate mb-1">{skin.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{skin.prompt}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                {new Date(skin.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
