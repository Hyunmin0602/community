import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import CollectionEditor from '@/components/admin/CollectionEditor';

export const dynamic = 'force-dynamic';

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect(`/auth/signin?callbackUrl=/admin/collections/${params.id}`);
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const collection = await prisma.collection.findUnique({
        where: { id: params.id },
        include: {
            items: {
                include: {
                    resource: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                            thumbnail: true,
                        }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!collection) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-8">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/collections" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            목록으로 돌아가기
                        </Link>
                        <h1 className="text-3xl font-black">컬렉션 편집</h1>
                    </div>
                    <Link
                        href={`/collections/${collection.slug}`}
                        target="_blank"
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        미리보기
                    </Link>
                </div>

                <CollectionEditor collection={collection} />
            </div>
        </div>
    );
}
