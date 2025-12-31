import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const comment = await prisma.postComment.findUnique({
            where: { id: params.id },
            select: { userId: true },
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (comment.userId !== session.user.id) {
            // Admin check can be added
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.postComment.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
