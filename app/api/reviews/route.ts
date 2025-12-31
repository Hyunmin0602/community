import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
        return NextResponse.json({ error: 'Missing resourceId' }, { status: 400 });
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { resourceId },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average scores if needed here or on client
        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { resourceId, rating, details, content } = body;

        if (!resourceId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const review = await prisma.review.upsert({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: session.user.id
                }
            },
            update: {
                rating,
                details: details || {}, // JSON object
                content
            },
            create: {
                resourceId,
                userId: session.user.id,
                rating,
                details: details || {},
                content
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Failed to post review:', error);
        return NextResponse.json({ error: 'Failed to post review' }, { status: 500 });
    }
}
