import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { resourceId, note } = body;

        if (!resourceId) {
            return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
        }

        // Get current max order
        const maxOrderAgg = await prisma.collectionItem.aggregate({
            where: { collectionId: params.id },
            _max: { order: true },
        });

        const nextOrder = (maxOrderAgg._max.order ?? 0) + 1;

        const item = await prisma.collectionItem.create({
            data: {
                collectionId: params.id,
                resourceId,
                note,
                order: nextOrder,
            },
            include: {
                resource: {
                    select: {
                        title: true,
                        category: true,
                        thumbnail: true,
                    }
                }
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Failed to add collection item:', error);
        return NextResponse.json(
            { error: 'Failed to add item to collection' },
            { status: 500 }
        );
    }
}
