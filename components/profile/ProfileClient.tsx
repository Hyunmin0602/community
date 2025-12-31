'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@prisma/client';
import { LayoutDashboard, Server, FileText, Package, User as UserIcon, Settings } from 'lucide-react';
import Image from 'next/image';

interface ProfileClientProps {
    user: User;
    stats: {
        serverCount: number;
        postCount: number;
        resourceCount: number;
    };
    recentServers: any[];
    recentPosts: any[];
    recentResources: any[];
}

export default function ProfileClient({
    user,
    stats,
    recentServers,
    recentPosts,
    recentResources
}: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SERVERS' | 'POSTS' | 'RESOURCES'>('OVERVIEW');

    return (
        <div className="container max-w-6xl py-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-8 bg-card rounded-2xl border shadow-sm">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-inner relative">
                        {user.image ? (
                            <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                        ) : (
                            <UserIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold">{user.name || '이름 없음'}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 justify-center md:justify-start pt-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-bold">
                            회원
                        </span>
                        <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                            가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                    </div>
                </div>

                <div>
                    <Link
                        href="/profile/edit"
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                        <Settings className="h-4 w-4" /> 프로필 수정
                    </Link>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Menus */}
                <div className="space-y-2 md:col-span-1">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'OVERVIEW'
                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        개요
                    </button>
                    <button
                        onClick={() => setActiveTab('SERVERS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'SERVERS'
                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <Server className="h-5 w-5" />
                        내 서버
                        <span className="ml-auto text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                            {stats.serverCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('POSTS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'POSTS'
                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <FileText className="h-5 w-5" />
                        작성 글
                        <span className="ml-auto text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                            {stats.postCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('RESOURCES')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'RESOURCES'
                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <Package className="h-5 w-5" />
                        내 자료
                        <span className="ml-auto text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                            {stats.resourceCount}
                        </span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3 min-h-[400px]">
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-primary" /> 활동 요약
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.serverCount}</div>
                                    <div className="text-sm text-muted-foreground font-medium">등록한 서버</div>
                                </div>
                                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 text-center">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.postCount}</div>
                                    <div className="text-sm text-muted-foreground font-medium">작성한 글</div>
                                </div>
                                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 text-center">
                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.resourceCount}</div>
                                    <div className="text-sm text-muted-foreground font-medium">업로드 자료</div>
                                </div>
                            </div>

                            {/* Recent Activity Previews could go here */}
                        </div>
                    )}

                    {activeTab === 'SERVERS' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Server className="h-5 w-5 text-primary" /> 등록한 서버 목록
                            </h2>
                            {recentServers.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl ">
                                    <p className="text-muted-foreground">아직 등록한 서버가 없습니다.</p>
                                    <Link href="/servers/new" className="text-primary hover:underline font-medium mt-2 block">
                                        + 서버 등록하러 가기
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {recentServers.map(server => (
                                        <div key={server.id} className="p-4 border rounded-xl hover:bg-muted/50 transition-colors flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg">{server.name}</h3>
                                                <p className="text-sm text-muted-foreground">{server.address || server.host}</p>
                                            </div>
                                            <Link href={`/servers/${server.id}`} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
                                                이동
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'POSTS' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-primary" /> 최근 작성한 글
                            </h2>
                            {recentPosts.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                    <p className="text-muted-foreground">작성한 게시글이 없습니다.</p>
                                    <Link href="/forum" className="text-primary hover:underline font-medium mt-2 block">
                                        + 커뮤니티 글쓰러 가기
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentPosts.map(post => (
                                        <Link key={post.id} href={`/forum/post/${post.id}`} className="block p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{post.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'RESOURCES' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Package className="h-5 w-5 text-primary" /> 업로드한 자료
                            </h2>
                            {recentResources.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                    <p className="text-muted-foreground">업로드한 자료가 없습니다.</p>
                                    <Link href="/resources" className="text-primary hover:underline font-medium mt-2 block">
                                        + 자료 공유하러 가기
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {recentResources.map(res => (
                                        <div key={res.id} className="p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                                            <h3 className="font-bold">{res.title}</h3>
                                            <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                                                <span>{res.category}</span>
                                                <span>다운로드: {res.downloadCount}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
