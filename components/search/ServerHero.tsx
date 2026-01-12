'use client';

import { Server } from '@prisma/client';
import { Copy, Check, Users, ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ServerHeroProps {
    server: Server & { _count?: { votes: number } };
}

export default function ServerHero({ server }: ServerHeroProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const address = server.host || '주소 정보 없음';
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group hover:shadow-md transition-all duration-300">
            {/* Background Image (Blurred & Dimmed) */}
            <div className="absolute inset-0 h-32 md:h-40 bg-slate-900">
                {server.banner ? (
                    <Image
                        src={server.banner}
                        alt="Background"
                        fill
                        className="object-cover opacity-40 group-hover:opacity-30 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-slate-900 opacity-50"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent"></div>
            </div>

            <div className="relative pt-16 px-5 pb-5 md:pt-20 md:px-7 md:pb-6 flex flex-col md:flex-row items-center md:items-end gap-5">

                {/* Server Icon (Floating) */}
                <div className="relative shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl bg-slate-100 dark:bg-zinc-800">
                        {server.icon ? (
                            <Image src={server.icon} alt={server.name} width={112} height={112} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                        )}
                    </div>
                </div>

                {/* Content Info */}
                <div className="flex-1 text-center md:text-left min-w-0 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white truncate">
                            {server.name}
                        </h2>
                        {server.isOfficial && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white shadow-sm self-center md:self-auto">
                                OFFICIAL
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                        {server.description || '최고의 마인크래프트 서버를 경험해보세요!'}
                    </p>

                    {/* Stats & Tags */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {server.onlinePlayers?.toLocaleString() || 0}명 접속 중
                        </div>

                        {server.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions (Right Side) */}
                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 w-full md:w-40 h-10 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? '주소 복사됨' : '서버 주소 복사'}
                    </button>
                    <Link
                        href={`/servers/${server.id}`}
                        className="flex items-center justify-center gap-2 w-full md:w-40 h-10 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        서버 상세정보
                    </Link>
                </div>
            </div>

            {/* Direct IP Display for clarity */}
            <div className="border-t border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50 px-5 py-2 flex items-center justify-center md:justify-between gap-4 text-xs text-slate-400 dark:text-slate-500 font-mono">
                <span className="flex items-center gap-2">
                    <Play className="w-3 h-3 fill-slate-400" />
                    서버 주소: <span className="text-slate-600 dark:text-slate-400 font-bold select-all">{server.host}</span>
                </span>
                <span className="hidden md:inline">버전: 1.20.4 (최신)</span>
            </div>
        </div>
    );
}
