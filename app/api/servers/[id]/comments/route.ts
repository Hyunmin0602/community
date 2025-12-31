import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const commentSchema = z.object({
    content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 1000자 이하로 입력해주세요'),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const comments = await prisma.comment.findMany({
            where: { serverId: params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        return NextResponse.json(
            { error: '댓글을 불러오는데 실패했습니다' },
            { status: 500 }
        );
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

        const body = await request.json();
        const validatedData = commentSchema.parse(body);

        const comment = await prisma.comment.create({
            data: {
                ...validatedData,
                serverId: params.id,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        console.error('Failed to create comment:', error);
        return NextResponse.json({ error: '댓글 작성에 실패했습니다' }, { status: 500 });
    }
}
