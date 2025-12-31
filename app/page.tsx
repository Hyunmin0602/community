import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight, TrendingUp, Download, Search, Sparkles, MessageSquare, BookOpen, Star, Crown } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // 1. 프리미엄 서버 (실제로는 투표 1-3위 또는 특정 로직)
    const premiumServers = await prisma.server.findMany({
        take: 2,
        include: { _count: { select: { votes: true } } },
        orderBy: { votes: { _count: 'desc' } },
    });

    // 2. 일반 서버 (나머지)
    const recentServers = await prisma.server.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { votes: true } } },
    });

    // 3. 커뮤니티 인기글
    const hotPosts = await prisma.post.findMany({
        take: 5,
        orderBy: { views: 'desc' },
        include: { _count: { select: { comments: true } } },
    });

    // 4. 최신 자료
    const newResources = await prisma.resource.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
    });

    // 5. 위키 업데이트
    const recentWikis = await prisma.wikiDoc.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
    });

    // 6. 추천 컬렉션 (NEW) - Error Handling Added
    let collections: any[] = [];
    try {
        collections = await prisma.collection.findMany({
            take: 3,
            orderBy: [
                { isOfficial: 'desc' },
                { createdAt: 'desc' },
            ],
            include: {
                user: {
                    select: { name: true, image: true },
                },
                items: {
                    take: 4,
                    include: {
                        resource: {
                            select: { thumbnail: true },
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error("Failed to fetch collections for main page:", error);
        // Fail silently and show empty section or nothing
        collections = [];
    }

    return (
        <div className="min-h-screen pb-20">
            {/* 히어로 섹션 */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden pb-10">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                </div>

                <div className="container relative py-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 border border-indigo-500/30">
                            <Sparkles className="h-4 w-4 text-indigo-300" />
                            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">The Best Minecraft Community</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                            상상 그 이상의 <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">마인크래프트 세상</span>
                        </h1>


                        {/* 검색바 */}
                        <div className="max-w-lg mx-auto relative group z-10 mt-32">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                                <form action="/search">
                                    <input
                                        type="text"
                                        name="q"
                                        placeholder="서버, 자료, 공략 검색... (예: 야생 서버 추천해줘)"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 text-slate-900 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium transition-all relative z-10"
                                    />
                                </form>
                            </div>

                            {/* 마스코트 캐릭터 - 검색바 위에 손을 얹음 */}
                            <div className="absolute -top-[120px] right-4 md:-top-[116px] md:right-8 pointer-events-none z-20 hidden sm:block">
                                <div className="relative animate-in slide-in-from-top-4 duration-700 delay-300">
                                    {/* 캐릭터 그림자 제거 (깔끔한 라인을 위해) */}

                                    {/* 말풍선 */}
                                    <div className="absolute top-2 right-full mr-4 bg-white text-slate-900 px-6 py-4 rounded-2xl rounded-tr-none shadow-xl border-2 border-indigo-500 z-30 whitespace-nowrap animate-in fade-in zoom-in duration-300 delay-500">
                                        <p className="font-pixel text-xl leading-snug">
                                            편하게 물어보세요!<br />제가 알려드릴게요!
                                        </p>
                                        {/* 말풍선 꼬리 */}
                                        <div className="absolute top-6 -right-2 w-4 h-4 bg-white border-r-2 border-t-2 border-indigo-500 transform rotate-45"></div>
                                    </div>

                                    {/* 캐릭터 이미지 */}            <img
                                        src="/images/mascot-guide.png"
                                        alt="Search Helper"
                                        className="w-32 h-32 md:w-36 md:h-36 object-contain relative transform hover:scale-105 transition-transform duration-300 drop-shadow-lgOrigin"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto -mt-10 relative z-20 px-4">
                {/* 프리미엄 서버 스팟 (수익성 영역) */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {premiumServers.length > 0 ? premiumServers.map((server, i) => (
                        <Link key={server.id} href={`/servers/${server.id}`} className="group relative">
                            {/* 골드 글로우 효과 */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>

                            <div className="relative h-40 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-2xl">
                                {/* 배너 배경 */}
                                <div className="absolute inset-0">
                                    {server.banner ? (
                                        <Image
                                            src={server.banner}
                                            alt={server.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700"></div>
                                    )}
                                </div>

                                {/* 프리미엄 전용 골드 그라데이션 오버레이 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-amber-900/30"></div>

                                {/* 프리미엄 뱃지 */}
                                <div className="absolute top-3 right-3 z-10">
                                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border-2 border-yellow-300/50">
                                        <Crown className="h-4 w-4" />
                                        PREMIUM
                                    </div>
                                </div>

                                {/* 컨텐츠 */}
                                <div className="relative h-full flex flex-col justify-between p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/20 backdrop-blur-md border-2 border-amber-400/30 flex items-center justify-center text-3xl shrink-0 shadow-2xl relative overflow-hidden">
                                            {server.icon ? <Image src={server.icon} alt={server.name} fill className="object-cover rounded-xl" /> : '🎮'}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="text-2xl font-black text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-2">
                                                {server.name}
                                            </h3>
                                            <p className="text-sm text-white/90 line-clamp-2 drop-shadow-lg">
                                                {server.description || '최고의 마인크래프트 서버를 경험하세요!'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs font-bold">
                                        <span className={`px-3 py-1 rounded-lg backdrop-blur-md border ${server.type === 'JAVA' ? 'bg-green-500/90 text-white border-green-400/50' : 'bg-blue-500/90 text-white border-blue-400/50'} shadow-lg`}>
                                            {server.type}
                                        </span>
                                        {server.version && (
                                            <span className="px-3 py-1 rounded-lg backdrop-blur-md border bg-indigo-500/90 text-white border-indigo-400/50 shadow-lg">
                                                {server.version}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-white/95 drop-shadow-lg">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-amber-300 font-black">{server._count.votes}</span> 투표
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-dashed border-amber-500/30 rounded-xl p-8 text-center">
                            <p className="text-lg font-bold text-amber-600 mb-2">당신의 서버를 이곳에 홍보하세요!</p>
                            <p className="text-sm text-muted-foreground mb-4">매일 수천 명의 유저가 당신의 서버를 기다립니다.</p>
                            <Link href="/servers/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-amber-500/25">
                                광고 문의하기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>



                {/* 추천 컬렉션 섹션 (NEW) */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-indigo-500" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                                에디터 추천 컬렉션
                            </span>
                        </h2>
                        {/* <Link href="/collections" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">전체보기</Link> */}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative block h-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 transition duration-500 blur"></div>
                                <div className="relative h-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                    {/* 썸네일 영역 */}
                                    <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        {collection.thumbnail ? (
                                            <Image
                                                src={collection.thumbnail}
                                                alt={collection.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                                                <Sparkles className="h-8 w-8 text-white/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            {collection.isOfficial && (
                                                <span className="inline-block bg-indigo-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 shadow-lg">
                                                    EDITOR&apos;S CHOICE
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">
                                                {collection.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* 컨텐츠 */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                                            {collection.description || '이 컬렉션에 대한 설명이 없습니다.'}
                                        </p>

                                        {/* 아이템 미리보기 */}
                                        <div className="flex items-center gap-2 mb-4">
                                            {collection.items.slice(0, 4).map((item: any, i: number) => (
                                                <div key={i} className="w-8 h-8 rounded-lg bg-muted border overflow-hidden relative shrink-0">
                                                    {item.resource.thumbnail ? (
                                                        <Image src={item.resource.thumbnail} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px]">📦</div>
                                                    )}
                                                </div>
                                            ))}
                                            {collection.items.length > 4 && (
                                                <div className="w-8 h-8 rounded-lg bg-muted border flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                                                    +{collection.items.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                                            <div className="w-5 h-5 rounded-full bg-muted overflow-hidden relative">
                                                {collection.user?.image ? (
                                                    <Image src={collection.user.image} alt={collection.user?.name || 'User'} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-300"></div>
                                                )}
                                            </div>
                                            <span>by {collection.user?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* 컬렉션이 없을 경우 안내 */}
                        {(!collections || collections.length === 0) && (
                            <div className="col-span-3 border border-dashed rounded-xl p-8 text-center bg-slate-50 dark:bg-zinc-900/50">
                                <p className="text-muted-foreground">아직 등록된 컬렉션이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 중간 그리드: 인기 서버 & 신규 자료 */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* 왼쪽: 인기 서버 (인기순) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                인기 서버
                            </h2>
                            <Link href="/servers" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">전체보기</Link>
                        </div>
                        <div className="space-y-3">
                            {recentServers.map((server) => (
                                <Link key={server.id} href={`/servers/${server.id}`} className="block group">
                                    <div className="relative h-24 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/50 hover:shadow-xl transition-all duration-300">
                                        <div className="absolute inset-0">
                                            {server.banner ? (
                                                <Image
                                                    src={server.banner}
                                                    alt={server.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700"></div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                                        <div className="relative h-full flex items-center gap-4 p-4">
                                            <div className="w-14 h-14 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shrink-0 shadow-lg relative overflow-hidden">
                                                {server.icon ? <Image src={server.icon} fill className="rounded-lg object-cover" alt={server.name} /> : '🎮'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-base text-white truncate drop-shadow-lg mb-1">
                                                    {server.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-md font-medium backdrop-blur-sm ${server.type === 'JAVA' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
                                                        {server.type}
                                                    </span>
                                                    {server.version && (
                                                        <span className="px-2 py-0.5 rounded-md font-medium backdrop-blur-sm bg-indigo-500/90 text-white">
                                                            {server.version}
                                                        </span>
                                                    )}
                                                    <span className="text-white/90 font-medium drop-shadow">👍 {server._count.votes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link href="/servers/new" className="block w-full py-3 border border-dashed rounded-xl text-center text-sm text-muted-foreground hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                            + 내 서버 등록하기
                        </Link>
                    </div>

                    {/* 오른쪽: 최신 자료 */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Download className="h-5 w-5 text-blue-500" />
                                따끈따끈 신규 자료
                            </h2>
                            <Link href="/resources" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">더보기</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {newResources.map((res) => (
                                <Link key={res.id} href={`/resources/${res.id}`} className="group">
                                    <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="aspect-video bg-slate-100 dark:bg-zinc-800 relative">
                                            {res.thumbnail ? (
                                                <Image src={res.thumbnail} alt={res.title} fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-2xl text-slate-300">📦</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {res.category}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-bold text-sm truncate group-hover:text-blue-500 transition-colors">{res.title}</h4>
                                            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                                                <span>{formatDate(res.createdAt)}</span>
                                                <span className="flex items-center gap-1"><Download className="h-2.5 w-2.5" />{res.downloadCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 하단 그리드: 커뮤니티 & 위키 */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* 커뮤니티 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                커뮤니티
                            </h2>
                            <Link href="/forum" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">더보기</Link>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl divide-y">
                            {hotPosts.length > 0 ? hotPosts.slice(0, 5).map((post, i) => (
                                <Link key={post.id} href={`/forum/${post.id}`} className="flex items-start gap-2 p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <div className="font-bold text-sm text-slate-300 w-4 text-center shrink-0">{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-xs truncate group-hover:text-indigo-500 transition-colors">{post.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                            <span className="bg-slate-100 dark:bg-zinc-800 px-1 rounded">{post.category}</span>
                                            <span>💬 {post._count.comments}</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-6 text-center text-xs text-muted-foreground">등록된 게시글이 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 위키 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-green-500" />
                                위키
                            </h2>
                            <Link href="/wiki" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">더보기</Link>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-3 space-y-2">
                            {recentWikis.length > 0 ? recentWikis.slice(0, 5).map((wiki) => (
                                <Link key={wiki.id} href={`/wiki/${wiki.slug}`} className="block group">
                                    <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                            <span className="text-xs font-medium group-hover:text-green-500 transition-colors truncate">{wiki.title}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(wiki.updatedAt)}</span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center text-xs text-muted-foreground py-4">등록된 위키가 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
