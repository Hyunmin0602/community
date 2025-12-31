import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, ChevronRight, BookOpen } from 'lucide-react';
import { WikiCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: {
        category?: string;
        search?: string;
    };
}

const categoryColors: Record<string, string> = {
    UPDATE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MECHANIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ITEM: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ENTITY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    GUIDE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default async function WikiPage({ searchParams }: PageProps) {
    const category = searchParams.category as WikiCategory | undefined;
    const search = searchParams.search;

    // 검색어나 카테고리가 있으면 기존 리스트 뷰 유지
    if (category || search) {
        const where: any = { published: true };
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const docs = await prisma.wikiDoc.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {category ? `${category} 문서` : '검색 결과'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            총 {docs.length}개의 문서가 있습니다.
                        </p>
                    </div>
                    {/* Search Form (Resused) */}
                    <form className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            name="search"
                            placeholder="문서 검색..."
                            defaultValue={search}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        {category && <input type="hidden" name="category" value={category} />}
                    </form>
                </div>

                {docs.length > 0 ? (
                    <div className="grid gap-4">
                        {docs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/wiki/${doc.slug}`}
                                className="card p-5 hover:border-primary/50 transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${categoryColors[doc.category] || 'bg-gray-100'}`}>
                                                {doc.category}
                                            </span>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {doc.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {doc.excerpt || doc.content.slice(0, 150)}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>조회 {doc.views}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>
        );
    }

    // 기본 뷰: 카테고리별 섹션 노출
    const categories: WikiCategory[] = ['UPDATE', 'MECHANIC', 'ITEM', 'ENTITY', 'GUIDE'];

    // 각 카테고리별로 최근 4개씩 가져오기
    const categoryDocs = await Promise.all(
        categories.map(async (cat) => {
            const docs = await prisma.wikiDoc.findMany({
                where: { published: true, category: cat },
                orderBy: { createdAt: 'desc' },
                take: 4,
            });
            return { category: cat, docs };
        })
    );

    return (
        <div className="space-y-10">
            {/* Header / Search */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">위키 센터</h1>
                    <p className="text-sm text-muted-foreground">
                        마인크래프트의 모든 지식을 탐험해보세요.
                    </p>
                </div>
                <form className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        name="search"
                        placeholder="전체 문서 검색..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </form>
            </div>

            {/* Category Sections */}
            <div className="space-y-12">
                {categoryDocs.map((section) => (
                    section.docs.length > 0 && (
                        <section key={section.category} className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className={`w-2 h-6 rounded-full ${categoryColors[section.category].split(' ')[0]}`}></span>
                                    {section.category}
                                </h2>
                                <Link
                                    href={`/wiki?category=${section.category}`}
                                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    더보기 <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.docs.map(doc => (
                                    <Link
                                        key={doc.id}
                                        href={`/wiki/${doc.slug}`}
                                        className="card p-4 hover:border-primary/50 transition-all hover:shadow-md group bg-card"
                                    >
                                        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {doc.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                                            {doc.excerpt || doc.content.slice(0, 100)}
                                        </p>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )
                ))}
            </div>

            {/* Empty State if absolutely nothing exists */}
            {categoryDocs.every(s => s.docs.length === 0) && (
                <div className="card p-12 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>등록된 위키 문서가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
