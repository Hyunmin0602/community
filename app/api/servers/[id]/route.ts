import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const server = await prisma.server.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                        comments: true,
                    },
                },
            },
        });

        if (!server) {
            return NextResponse.json({ error: '서버를 찾을 수 없습니다' }, { status: 404 });
        }

        return NextResponse.json(server);
    } catch (error) {
        console.error('Failed to fetch server:', error);
        return NextResponse.json(
            { error: '서버 정보를 불러오는데 실패했습니다' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    try {
        const server = await prisma.server.findUnique({
            where: { id: params.id },
        });

        if (!server) {
            return NextResponse.json({ error: '서버를 찾을 수 없습니다' }, { status: 404 });
        }

        if (server.userId !== session.user.id) {
            return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
        }

        const body = await req.json();

        const updatedServer = await prisma.server.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                host: body.host,
                port: body.port,
                type: body.type,
                version: body.version,
                banner: body.banner,
                website: body.website,
                discord: body.discord,
                tags: body.tags,
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.error('Failed to update server:', error);
        return NextResponse.json(
            { error: '서버 수정에 실패했습니다' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    try {
        const server = await prisma.server.findUnique({
            where: { id: params.id },
        });

        if (!server) {
            return NextResponse.json({ error: '서버를 찾을 수 없습니다' }, { status: 404 });
        }

        if (server.userId !== session.user.id) {
            return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
        }

        await prisma.server.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete server:', error);
        return NextResponse.json(
            { error: '서버 삭제에 실패했습니다' },
            { status: 500 }
        );
    }
}
