import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // ADMIN 체크
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
        }

        const body = await request.json();
        const { isVerified, isOfficial } = body;

        const server = await prisma.server.update({
            where: { id: params.id },
            data: {
                ...(typeof isVerified === 'boolean' && { isVerified }),
                ...(typeof isOfficial === 'boolean' && { isOfficial }),
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.error('Failed to verify server:', error);
        return NextResponse.json(
            { error: '서버 상태 업데이트에 실패했습니다' },
            { status: 500 }
        );
    }
}
