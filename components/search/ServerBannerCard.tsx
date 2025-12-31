import Link from 'next/link';
import { Server } from '@prisma/client';

interface ServerBannerCardProps {
    server: Server & { _count?: { votes: number } };
    size?: 'lg' | 'md';
    priority?: boolean;
}

export default function ServerBannerCard({ server, size = 'md', priority = false }: ServerBannerCardProps) {
    const isLarge = size === 'lg';

    // Height Classes
    const heightClass = isLarge ? 'h-40 md:h-48' : 'h-28 md:h-36';

    // Icon Size Classes
    const iconSizeClass = isLarge ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14 md:w-16 md:h-16';

    // Title Size Classes
    const titleSizeClass = isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';

    // Desc Size Classes
    const descSizeClass = isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm';

    return (
        <Link href={`/servers/${server.id}`} className={`block group relative ${heightClass} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
            {/* Background Banner */}
            <div className="absolute inset-0">
                {server.banner ? (
                    <img
                        src={server.banner}
                        alt={server.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading={priority ? "eager" : "lazy"}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-800"></div>
                )}
                {/* Overlay - Darkening for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>

            {/* Content (White Text on Dark Overlay) */}
            <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 md:gap-5">
                    {/* Icon */}
                    <div className={`${iconSizeClass} rounded-xl bg-white/10 backdrop-blur border border-white/20 shrink-0 overflow-hidden shadow-lg group-hover:scale-110 transition-transform bg-black/50`}>
                        {server.icon ? (
                            <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🎮</div>
                        )}
                    </div>

                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`${titleSizeClass} font-black text-white group-hover:text-yellow-400 transition-colors drop-shadow-md truncate max-w-[200px] md:max-w-md`}>
                                {server.name}
                            </h3>
                            {server.isOfficial && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold shrink-0">OFFICIAL</span>}
                        </div>
                        <p className={`${descSizeClass} text-slate-200 line-clamp-1 max-w-sm md:max-w-xl group-hover:text-white transition-colors drop-shadow-sm`}>
                            {server.description || '최고의 마인크래프트 서버를 경험하세요!'}
                        </p>

                        {/* Tags / Meta */}
                        <div className="flex items-center gap-2">
                            {isLarge ? (
                                <>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md border ${server.type === 'JAVA' ? 'bg-green-500/80 text-white border-green-400/50' : 'bg-blue-500/80 text-white border-blue-400/50'}`}>
                                        {server.type}
                                    </span>
                                    <span className="hidden md:flex items-center gap-1 text-[10px] text-white/90 bg-black/30 px-2 py-0.5 rounded border border-white/10">
                                        👍 {server._count?.votes || 0}
                                    </span>
                                </>
                            ) : (
                                server.tags.slice(0, 3).map(t => (
                                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-slate-200 border border-white/10 group-hover:border-white/30 transition-colors">
                                        #{t}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Stats */}
                <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold bg-black/40 px-3 py-1 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs md:text-sm">{server.onlinePlayers || 0} 접속</span>
                    </div>
                    <span className="bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/20 backdrop-blur-sm shadow-md">
                        서버 입장
                    </span>
                </div>
            </div>
        </Link>
    );
}
