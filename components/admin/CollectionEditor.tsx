'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Trash2, Plus, Search, GripVertical, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface CollectionEditorProps {
    collection: any;
}

export default function CollectionEditor({ collection: initialCollection }: CollectionEditorProps) {
    const router = useRouter();
    const [collection, setCollection] = useState(initialCollection);
    const [items, setItems] = useState<any[]>(initialCollection.items);

    // Edit Form State
    const [title, setTitle] = useState(collection.title);
    const [slug, setSlug] = useState(collection.slug);
    const [description, setDescription] = useState(collection.description);
    const [thumbnail, setThumbnail] = useState(collection.thumbnail || '');
    const [isOfficial, setIsOfficial] = useState(collection.isOfficial);

    // UI State
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [addingItemId, setAddingItemId] = useState<string | null>(null);

    // Save Collection Details
    const handleSaveDetails = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/collections/${collection.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, description, thumbnail, isOfficial }),
            });

            if (!res.ok) throw new Error('Failed to update collection');

            alert('컬렉션 정보가 저장되었습니다.');
            router.refresh();
        } catch (error) {
            alert('저장 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Delete Collection
    const handleDeleteCollection = async () => {
        if (!confirm('정말로 이 컬렉션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            const res = await fetch(`/api/admin/collections/${collection.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            router.push('/admin/collections');
        } catch (error) {
            alert('삭제 실패');
        }
    };

    // Search Resources
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const res = await fetch(`/api/resources?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    }, []);

    // Add Item
    const handleAddItem = async (resource: any) => {
        setAddingItemId(resource.id);
        try {
            const res = await fetch(`/api/admin/collections/${collection.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId: resource.id }),
            });

            if (!res.ok) throw new Error('Failed to add item');

            const newItem = await res.json();
            setItems((prev) => [...prev, newItem]);
            setSearchQuery('');
            setSearchResults([]);
            setIsSearchOpen(false);
        } catch (error) {
            alert('아이템 추가 실패');
        } finally {
            setAddingItemId(null);
        }
    };

    // Remove Item
    const handleRemoveItem = async (itemId: string) => {
        if (!confirm('목록에서 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/collections/${collection.id}/items/${itemId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete item');

            setItems((prev) => prev.filter(item => item.id !== itemId));
        } catch (error) {
            alert('삭제 실패');
        }
    };

    // Update Note
    const handleUpdateNote = async (itemId: string, note: string) => {
        try {
            const res = await fetch(`/api/admin/collections/${collection.id}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note }),
            });

            if (!res.ok) throw new Error('Failed to update note');
        } catch (error) {
            console.error('Note update failed', error);
        }
    };

    // Move Item (Simple Swap for now, or updating order directly)
    // For simplicity, sticking to manual order edit could be easier, OR just Up/Down buttons
    const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const currentItem = items[index];
        const targetItem = items[targetIndex];

        // Optimistic update
        const newItems = [...items];
        newItems[index] = { ...targetItem, order: currentItem.order };
        newItems[targetIndex] = { ...currentItem, order: targetItem.order };
        // Sort by order
        newItems.sort((a, b) => a.order - b.order);
        setItems(newItems);

        try {
            // Apply updates
            await Promise.all([
                fetch(`/api/admin/collections/${collection.id}/items/${currentItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: targetItem.order }),
                }),
                fetch(`/api/admin/collections/${collection.id}/items/${targetItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: currentItem.order }),
                })
            ]);
        } catch (error) {
            alert('순서 변경 실패');
            router.refresh(); // Revert
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Edit Details */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">컬렉션 정보 수정</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="label block mb-1">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label block mb-1">슬러그</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="input w-full font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="label block mb-1">설명</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input w-full h-32 resize-none"
                            />
                        </div>
                        <div>
                            <label className="label block mb-1">썸네일 URL</label>
                            <input
                                type="text"
                                value={thumbnail}
                                onChange={(e) => setThumbnail(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        {thumbnail && (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                                <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isOfficial}
                                onChange={(e) => setIsOfficial(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label>공식 컬렉션 지정</label>
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                            <button
                                onClick={handleSaveDetails}
                                disabled={saving}
                                className="btn-primary w-full flex justify-center items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                                저장하기
                            </button>
                            <button
                                onClick={handleDeleteCollection}
                                className="btn-secondary w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                컬렉션 삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Manage Items */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">아이템 관리 ({items.length})</h2>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            자료 추가
                        </button>
                    </div>

                    {/* Search Panel */}
                    {isSearchOpen && (
                        <div className="mb-6 bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg border">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="자료 검색 (제목)..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="input w-full pl-10"
                                />
                            </div>

                            {searching && <div className="text-center py-4">검색 중...</div>}

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {searchResults.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded border">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 rounded overflow-hidden bg-muted">
                                                {res.thumbnail && <Image src={res.thumbnail} alt="" fill className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{res.title}</p>
                                                <p className="text-xs text-muted-foreground">{res.category}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddItem(res)}
                                            disabled={addingItemId === res.id}
                                            className="btn-secondary text-xs"
                                        >
                                            {addingItemId === res.id ? '추가 중...' : '추가'}
                                        </button>
                                    </div>
                                ))}
                                {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                                    <div className="text-center py-4 text-muted-foreground">검색 결과가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                                컬렉션에 등록된 자료가 없습니다.
                            </div>
                        ) : items.map((item, index) => (
                            <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-950">
                                <div className="flex flex-col gap-1 mt-1">
                                    <button
                                        onClick={() => handleMoveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveItem(index, 'down')}
                                        disabled={index === items.length - 1}
                                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                    {item.resource.thumbnail && (
                                        <Image src={item.resource.thumbnail} alt="" fill className="object-cover" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold truncate">{item.resource.title}</h4>
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.resource.category}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <label className="text-xs font-semibold text-muted-foreground">큐레이터 노트</label>
                                        <textarea
                                            defaultValue={item.note || ''}
                                            onBlur={(e) => handleUpdateNote(item.id, e.target.value)}
                                            className="input w-full text-sm mt-1 min-h-[60px]"
                                            placeholder="이 자료에 대한 코멘트를 남겨주세요."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
