'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Book, Compass, FileText, Zap, Box } from 'lucide-react';

const categories = [
    { id: 'ALL', name: '전체', icon: Book, href: '/wiki' },
    { id: 'UPDATE', name: '업데이트', icon: Zap, href: '/wiki?category=UPDATE' },
    { id: 'MECHANIC', name: '시스템', icon: Compass, href: '/wiki?category=MECHANIC' },
    { id: 'ITEM', name: '아이템', icon: Box, href: '/wiki?category=ITEM' },
    { id: 'ENTITY', name: '엔티티', icon: FileText, href: '/wiki?category=ENTITY' },
    { id: 'GUIDE', name: '가이드', icon: Book, href: '/wiki?category=GUIDE' },
];

export default function WikiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'ALL';

    return (
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="card p-4 bg-primary/5 border-primary/20">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Book className="h-5 w-5 text-primary" />
                            위키
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            마인크래프트의 모든 지식을 담았습니다.
                        </p>
                    </div>

                    <nav className="space-y-1">
                        {categories.map((item) => {
                            const isActive = currentCategory === item.id;

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
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
