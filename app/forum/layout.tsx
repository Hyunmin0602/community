'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, HelpCircle, Lightbulb, Megaphone, LayoutGrid, PenSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

const categories = [
    { id: 'ALL', name: '전체글', icon: LayoutGrid, href: '/forum' },
    { id: 'NOTICE', name: '공지사항', icon: Megaphone, href: '/forum/notice' },
    { id: 'FREE', name: '자유게시판', icon: MessageSquare, href: '/forum/free' },
    { id: 'QUESTION', name: '질문게시판', icon: HelpCircle, href: '/forum/question' },
    { id: 'TIP', name: '팁과 노하우', icon: Lightbulb, href: '/forum/tip' },
];

export default function ForumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Write Button */}
                    <Link
                        href={session ? "/forum/write" : "/auth/signin"}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                        <PenSquare className="h-5 w-5" />
                        <span className="font-semibold">글쓰기</span>
                    </Link>

                    {/* Category Menu */}
                    <div className="card p-2 space-y-1">
                        {categories.map((item) => {
                            const isActive =
                                item.href === '/forum'
                                    ? pathname === '/forum'
                                    : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
