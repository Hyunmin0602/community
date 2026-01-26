import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';
const RichTextEditor = nextDynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { ArrowLeft, ExternalLink, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        slug: string;
    };
}

const categoryColors: Record<string, string> = {
    UPDATE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MECHANIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ITEM: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ENTITY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    GUIDE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default async function WikiDetailPage({ params }: PageProps) {
    const doc = await prisma.wikiDoc.findUnique({
        where: { slug: params.slug },
    });

    if (!doc) {
        notFound();
    }

    // Increment views
    await prisma.wikiDoc.update({
        where: { id: doc.id },
        data: { views: { increment: 1 } },
    });

    return (
        <div className="space-y-6">
            <Link href="/wiki" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <article className="card p-8">
                <header className="border-b pb-6 mb-8 space-y-4">
                    <span className={`inline-block text-xs px-2 py-1 rounded font-bold ${categoryColors[doc.category] || 'bg-gray-100'}`}>
                        {doc.category}
                    </span>
                    <h1 className="text-3xl font-bold">{doc.title}</h1>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {doc.views}회
                        </span>
                        {doc.sourceUrl && (
                            <a
                                href={doc.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary hover:underline"
                            >
                                <ExternalLink className="h-3 w-3" />
                                원문 보기
                            </a>
                        )}
                    </div>
                </header>

                <div className="min-h-[200px]">
                    <RichTextEditor value={doc.content} readOnly />
                </div>
            </article>
        </div>
    );
}
