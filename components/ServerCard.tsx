'use client';

import Link from 'next/link';
import { Server as ServerType } from '@prisma/client';
import { Users, Heart, Clock, ShieldCheck, Star } from 'lucide-react';
import { formatDate, formatPlayerCount, getServerTypeLabel } from '@/lib/utils';

interface ServerCardProps {
    server: ServerType & {
        _count?: {
            votes: number;
        };
        isVerified?: boolean;
        isOfficial?: boolean;
    };
    layout?: 'vertical' | 'horizontal';
}

export default function ServerCard({ server, layout = 'vertical' }: ServerCardProps) {
    const voteCount = server._count?.votes || 0;

    if (layout === 'horizontal') {
        return (
            <Link href={`/servers/${server.id}`}>
                <div className="card p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.005] group border-l-4 border-l-transparent hover:border-l-primary">
                    <div className="flex items-center gap-6">
                        {/* Left: Status indicator */}
                        <div className="shrink-0">
                            <div
                                className={`w-3 h-3 rounded-full ${server.isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'}`}
                            />
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">{server.name}</h3>
                                {server.isOfficial && (
                                    <Star className="h-4 w-4 text-amber-500 fill-current shrink-0" />
                                )}
                                {server.isVerified && (
                                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                                )}
                            </div>
                            {server.description && (
                                <p className="text-muted-foreground text-sm line-clamp-1">
                                    {server.description}
                                </p>
                            )}
                        </div>

                        {/* Right: Metadata */}
                        <div className="flex items-center gap-6 shrink-0 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`badge ${server.type === 'JAVA' ? 'badge-java' : 'badge-bedrock'}`}
                                >
                                    {getServerTypeLabel(server.type)}
                                </span>
                                {server.isOfficial && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        공식
                                    </span>
                                )}
                            </div>

                            {server.isOnline && server.onlinePlayers !== null && server.maxPlayers !== null && (
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    <span>{formatPlayerCount(server.onlinePlayers, server.maxPlayers)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <Heart className="h-4 w-4" />
                                <span>{voteCount}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span className="hidden lg:inline">{formatDate(server.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Original vertical layout
    return (
        <Link href={`/servers/${server.id}`}>
            <div className="card p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in group border-l-4 border-l-transparent hover:border-l-primary">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{server.name}</h3>
                            {server.isOfficial && (
                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                            )}
                            {server.isVerified && (
                                <ShieldCheck className="h-4 w-4 text-blue-500" />
                            )}
                        </div>
                        <div className="flex gap-1.5">
                            <span
                                className={`badge ${server.type === 'JAVA' ? 'badge-java' : 'badge-bedrock'
                                    }`}
                            >
                                {getServerTypeLabel(server.type)}
                            </span>
                            {server.isOfficial && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    OFFICIAL
                                </span>
                            )}
                        </div>
                    </div>
                    <div
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${server.isOnline
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${server.isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-500'
                                }`}
                        />
                        <span>{server.isOnline ? '온라인' : '오프라인'}</span>
                    </div>
                </div>

                {server.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {server.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                        {server.isOnline && server.onlinePlayers !== null && server.maxPlayers !== null && (
                            <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{formatPlayerCount(server.onlinePlayers, server.maxPlayers)}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{voteCount}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(server.createdAt)}</span>
                    </div>
                </div>

                {server.motd && (
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground font-mono">
                        {server.motd}
                    </div>
                )}
            </div>
        </Link>
    );
}
