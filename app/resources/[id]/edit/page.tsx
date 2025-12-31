import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import ResourceForm from '@/components/resources/ResourceForm';

interface EditResourcePageProps {
    params: {
        id: string;
    };
}

export default async function EditResourcePage({ params }: EditResourcePageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    const resource = await prisma.resource.findUnique({
        where: { id: params.id },
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!resource) {
        notFound();
    }

    // Check ownership
    if (session.user?.email !== resource.user.email) {
        redirect(`/resources/${params.id}`);
    }

    const initialData = {
        title: resource.title,
        description: resource.description || '',
        category: resource.category,
        fileUrl: resource.fileUrl,
        thumbnail: resource.thumbnail || '',
        version: resource.version || '',
        tags: resource.tags,
    };

    return (
        <div className="container py-8">
            <div className="max-w-5xl mx-auto">
                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-2">자료 수정</h1>
                    <p className="text-muted-foreground mb-6">
                        자료 정보를 수정하세요
                    </p>

                    <ResourceForm resourceId={resource.id} initialData={initialData} />
                </div>
            </div>
        </div>
    );
}
