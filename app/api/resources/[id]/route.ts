import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다' }, { status: 404 });
        }

        return NextResponse.json(resource);
    } catch (error) {
        console.error('Failed to fetch resource:', error);
        return NextResponse.json(
            { error: '자료를 불러오는데 실패했습니다' },
            { status: 500 }
        );
    }
}

// PUT - 자료 수정
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        const resource = await prisma.resource.findUnique({
            where: { id: params.id },
        });

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다' }, { status: 404 });
        }

        if (resource.userId !== session.user.id) {
            return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, category, fileUrl, thumbnail, version, tags } = body;

        const updatedResource = await prisma.resource.update({
            where: { id: params.id },
            data: {
                title,
                description,
                category,
                fileUrl,
                thumbnail,
                version,
                tags,
            },
        });

        return NextResponse.json(updatedResource);
    } catch (error) {
        console.error('Failed to update resource:', error);
        return NextResponse.json(
            { error: '자료 수정에 실패했습니다' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        const resource = await prisma.resource.findUnique({
            where: { id: params.id },
        });

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다' }, { status: 404 });
        }

        if (resource.userId !== session.user.id) {
            return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
        }

        await prisma.resource.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete resource:', error);
        return NextResponse.json(
            { error: '자료 삭제에 실패했습니다' },
            { status: 500 }
        );
    }
}
