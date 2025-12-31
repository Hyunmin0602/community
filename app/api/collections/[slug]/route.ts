import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        const collection = await prisma.collection.findUnique({
            where: { slug: params.slug },
            include: {
                user: {
                    select: { name: true, image: true, role: true }
                },
                items: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                thumbnail: true,
                                category: true,
                                downloadCount: true,
                                user: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!collection) {
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        // Increment views async
        await prisma.collection.update({
            where: { id: collection.id },
            data: { views: { increment: 1 } }
        });

        return NextResponse.json(collection);
    } catch (error) {
        console.error('Failed to fetch collection:', error);
        return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
    }
}
