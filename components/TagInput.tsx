'use client';

import { useState, useEffect, useRef } from 'react';
// import { useDebounce } from '@/lib/hooks/useDebounce';

interface Tag {
    id: string;
    name: string;
    count: number;
}

interface TagInputProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: string[]; // Allow passing static suggestions too
}

export default function TagInput({ selectedTags, onChange, placeholder = "태그를 입력하세요", suggestions = [] }: TagInputProps) {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<Tag[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // If useDebounce doesn't exist, we'll manually debounce in useEffect
    const [debouncedInput, setDebouncedInput] = useState(input);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedInput(input), 300);
        return () => clearTimeout(timer);
    }, [input]);

    useEffect(() => {
        async function fetchTags() {
            if (debouncedInput.length < 1) {
                setResults([]);
                return;
            }
            try {
                const res = await fetch(`/api/tags?q=${encodeURIComponent(debouncedInput)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Failed to search tags", error);
            }
        }
        if (debouncedInput) fetchTags();
    }, [debouncedInput]);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !selectedTags.includes(trimmed)) {
            onChange([...selectedTags, trimmed]);
        }
        setInput('');
        setResults([]);
        setIsOpen(false);
    };

    const removeTag = (tag: string) => {
        onChange(selectedTags.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input);
        }
        if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white dark:bg-zinc-900 focus-within:ring-2 ring-primary">
                {selectedTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 min-w-[120px] outline-none bg-transparent"
                    placeholder={selectedTags.length === 0 ? placeholder : ''}
                />
            </div>

            {isOpen && (results.length > 0 || suggestions.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                    {/* Database Results */}
                    {results.length > 0 && (
                        <div className="p-2">
                            <p className="text-xs text-muted-foreground mb-1 px-2">검색 결과</p>
                            {results.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => addTag(tag.name)}
                                    className="block w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm text-sm"
                                >
                                    {tag.name} <span className="text-xs text-muted-foreground">({tag.count})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Static Suggestions (Optional) */}
                    {suggestions.length > 0 && !input && (
                        <div className="p-2 border-t dark:border-zinc-700">
                            <p className="text-xs text-muted-foreground mb-1 px-2">추천 태그</p>
                            <div className="flex flex-wrap gap-1 px-2">
                                {suggestions.filter(s => !selectedTags.includes(s)).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => addTag(s)}
                                        className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Click outside to close - simplified for now, relying on blur or re-focus logic might be needed for robust UI, but this is MVP */}
            {isOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
