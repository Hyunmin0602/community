import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ liked: false });
        }

        const like = await prisma.resourceLike.findUnique({
            where: {
                resourceId_userId: {
                    resourceId: params.id,
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({ liked: !!like });
    } catch (error) {
        console.error('Failed to check like status:', error);
        return NextResponse.json({ liked: false });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        const existingLike = await prisma.resourceLike.findUnique({
            where: {
                resourceId_userId: {
                    resourceId: params.id,
                    userId: session.user.id,
                },
            },
        });

        if (existingLike) {
            await prisma.resourceLike.delete({
                where: { id: existingLike.id },
            });
            return NextResponse.json({ liked: false });
        } else {
            await prisma.resourceLike.create({
                data: {
                    resourceId: params.id,
                    userId: session.user.id,
                },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Failed to toggle like:', error);
        return NextResponse.json(
            { error: '좋아요 처리에 실패했습니다' },
            { status: 500 }
        );
    }
}
