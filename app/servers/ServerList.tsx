'use client';

import { useState, useMemo } from 'react';
import { Server } from '@prisma/client';
import ServerCard from '@/components/ServerCard';
import ServerFilter from '@/components/ServerFilter';

interface ServerListProps {
    initialServers: (Server & {
        _count: {
            votes: number;
        };
    })[];
}

export default function ServerList({ initialServers }: ServerListProps) {
    const [selectedType, setSelectedType] = useState<'ALL' | 'JAVA' | 'BEDROCK'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'votes' | 'players'>('latest');

    const filteredServers = useMemo(() => {
        let filtered = [...initialServers];

        // Filter by type
        if (selectedType !== 'ALL') {
            filtered = filtered.filter((server) => server.type === selectedType);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (server) =>
                    server.name.toLowerCase().includes(query) ||
                    server.description?.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'votes':
                filtered.sort((a, b) => b._count.votes - a._count.votes);
                break;
            case 'players':
                filtered.sort((a, b) => {
                    const aPlayers = a.onlinePlayers || 0;
                    const bPlayers = b.onlinePlayers || 0;
                    return bPlayers - aPlayers;
                });
                break;
            case 'latest':
            default:
                filtered.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
        }

        return filtered;
    }, [initialServers, selectedType, searchQuery, sortBy]);

    return (
        <>
            <ServerFilter
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {filteredServers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        검색 결과가 없습니다.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredServers.map((server) => (
                        <ServerCard key={server.id} server={server} layout="horizontal" />
                    ))}
                </div>
            )}
        </>
    );
}
