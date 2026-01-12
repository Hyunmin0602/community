'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Moon, Sun, Menu, Server, Plus, LogOut, User, LogIn, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (session) console.log('Current Session:', session);
    }, [session]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                        <Image
                            src="/logo.svg"
                            alt="Pixelit"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Pixelit
                        </span>
                        <span className="text-xs text-muted-foreground -mt-1 font-medium">픽셀릿</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    <Link href="/" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-muted">
                        홈
                    </Link>

                    {/* 서버 목록 */}
                    <div className="relative group px-4 py-2">
                        <Link href="/servers" className="text-sm font-medium transition-colors hover:text-primary group-hover:text-primary flex items-center gap-1">
                            서버 목록
                        </Link>
                        <div className="absolute top-full left-0 pt-2 w-40 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50">
                            <div className="bg-white dark:bg-zinc-950 border rounded-lg shadow-lg p-2 flex flex-col gap-1">
                                <Link href="/servers?edition=java" className="block px-3 py-2 text-sm rounded-md hover:bg-muted font-medium transition-colors">
                                    Java Edition
                                </Link>
                                <Link href="/servers?edition=bedrock" className="block px-3 py-2 text-sm rounded-md hover:bg-muted font-medium transition-colors">
                                    Bedrock Edition
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 자료실 (Mega Menu) */}
                    <div className="relative group px-4 py-2">
                        <Link href="/resources" className="text-sm font-medium transition-colors hover:text-primary group-hover:text-primary flex items-center gap-1">
                            자료실
                        </Link>
                        <div className="absolute top-full -left-20 pt-2 w-[500px] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50">
                            <div className="bg-white dark:bg-zinc-950 border rounded-lg shadow-lg p-4 grid grid-cols-3 gap-6">
                                {/* JE */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Java Edition</h4>
                                    <div className="flex flex-col gap-1">
                                        <Link href="/resources/je/map" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">맵</Link>
                                        <Link href="/resources/je/plugin" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">플러그인</Link>
                                        <Link href="/resources/je/mod" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">모드</Link>
                                        <Link href="/resources/je/serverpack" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">서버팩</Link>
                                        <Link href="/resources/je/seed" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">시드</Link>
                                    </div>
                                </div>
                                {/* Bedrock */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Bedrock</h4>
                                    <div className="flex flex-col gap-1">
                                        <Link href="/resources/be/map" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">맵</Link>
                                        <Link href="/resources/be/addon" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">애드온</Link>
                                        <Link href="/resources/be/serverpack" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">서버팩</Link>
                                        <Link href="/resources/be/seed" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">시드</Link>
                                    </div>
                                </div>
                                {/* Other */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">General</h4>
                                    <div className="flex flex-col gap-1">
                                        <Link href="/resources/skin" className="text-sm hover:text-primary hover:bg-muted px-2 py-1 rounded transition-colors">스킨</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 커뮤니티 */}
                    <div className="relative group px-4 py-2">
                        <Link href="/forum" className="text-sm font-medium transition-colors hover:text-primary group-hover:text-primary flex items-center gap-1">
                            커뮤니티
                        </Link>
                        <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50">
                            <div className="bg-white dark:bg-zinc-950 border rounded-lg shadow-lg p-2 flex flex-col gap-1">
                                <Link href="/forum/free" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">자유 게시판</Link>
                                <Link href="/forum/qna" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">질문 게시판</Link>
                                <Link href="/forum/info" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">정보 공유</Link>
                                <div className="h-px bg-border my-1" />
                                <Link href="/forum/dev-server" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">서버 개발</Link>
                                <Link href="/forum/dev-map" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">맵 개발</Link>
                                <Link href="/forum/dev-mod" className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">모드 개발</Link>
                            </div>
                        </div>
                    </div>

                    <Link href="/wiki" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-muted">
                        위키
                    </Link>
                    {session ? (
                        <>
                            <div className="flex items-center space-x-3">
                                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {session.user.name || session.user.email}
                                </Link>
                                {(session.user as any)?.role === 'ADMIN' && (
                                    <Link href="/admin" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                                        <Shield className="h-4 w-4" />
                                        <span>관리자</span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="btn-ghost flex items-center space-x-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link href="/auth/signin" className="btn-primary flex items-center space-x-2">
                            <LogIn className="h-4 w-4" />
                            <span>로그인</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn-ghost"
                        aria-label="테마 전환"
                    >
                        {mounted && (theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        ))}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center space-x-2">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn-ghost p-2"
                        aria-label="테마 전환"
                    >
                        {mounted && (theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        ))}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="btn-ghost p-2"
                        aria-label="메뉴"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {
                mobileMenuOpen && (
                    <div className="md:hidden border-t bg-background p-4 space-y-3 animate-slide-up">
                        <Link
                            href="/"
                            className="block py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            홈
                        </Link>
                        <Link
                            href="/servers"
                            className="block py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            서버 목록
                        </Link>
                        <Link
                            href="/resources"
                            className="block py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            자료실
                        </Link>
                        <Link
                            href="/forum"
                            className="block py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            커뮤니티
                        </Link>
                        <Link
                            href="/wiki"
                            className="block py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            위키
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="block py-2 text-sm text-muted-foreground border-t hover:text-primary transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {session.user.name || session.user.email}
                                </Link>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left py-2 text-sm font-medium hover:text-primary"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="block py-2 text-sm font-medium hover:text-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                로그인
                            </Link>
                        )}
                    </div>
                )
            }
        </header>
    );
}
