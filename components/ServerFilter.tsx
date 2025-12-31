'use client';

import { Search, Filter } from 'lucide-react';

interface ServerFilterProps {
    selectedType: 'ALL' | 'JAVA' | 'BEDROCK';
    onTypeChange: (type: 'ALL' | 'JAVA' | 'BEDROCK') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: 'latest' | 'votes' | 'players';
    onSortChange: (sort: 'latest' | 'votes' | 'players') => void;
}

export default function ServerFilter({
    selectedType,
    onTypeChange,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
}: ServerFilterProps) {
    return (
        <div className="card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="서버 검색..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>

                {/* Server Type Filter */}
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={selectedType}
                        onChange={(e) => onTypeChange(e.target.value as 'ALL' | 'JAVA' | 'BEDROCK')}
                        className="input w-full md:w-auto"
                    >
                        <option value="ALL">전체</option>
                        <option value="JAVA">자바 에디션</option>
                        <option value="BEDROCK">베드락 에디션</option>
                    </select>
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as 'latest' | 'votes' | 'players')}
                    className="input w-full md:w-auto"
                >
                    <option value="latest">최신순</option>
                    <option value="votes">추천순</option>
                    <option value="players">플레이어순</option>
                </select>
            </div>
        </div>
    );
}
