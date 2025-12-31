import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Auth options might be here or similar path
import { prisma } from '@/lib/prisma'; // Ensure prisma instance is available

export async function GET(request: Request) {
    try {
        const collections = await prisma.collection.findMany({
            include: {
                user: {
                    select: { name: true, image: true }
                },
                items: {
                    take: 3, // Preview 3 items
                    include: {
                        resource: {
                            select: { thumbnail: true }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: {
                isOfficial: 'desc', // Official first
            }
        });

        return NextResponse.json(collections);
    } catch (error) {
        console.error('Failed to fetch collections:', error);
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') { // Only Admin for now
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, thumbnail, slug, isOfficial, items = [] } = body;

        // Validation (simplified)
        if (!title || !slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const collection = await prisma.collection.create({
            data: {
                title,
                description,
                thumbnail,
                slug,
                isOfficial: isOfficial || false,
                userId: session.user.id,
                items: {
                    create: items.map((item: any, index: number) => ({
                        resourceId: item.resourceId,
                        order: index,
                        note: item.note
                    }))
                }
            }
        });

        return NextResponse.json(collection);
    } catch (error) {
        console.error('Failed to create collection:', error);
        return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }
}
