import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // views 증가
        const post = await prisma.post.update({
            where: { id: params.id },
            data: {
                views: {
                    increment: 1,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id: params.id },
            select: { userId: true },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.userId !== session.user.id) {
            // Admin check could be added here
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
}
