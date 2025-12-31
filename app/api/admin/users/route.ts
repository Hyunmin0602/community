import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 관리자 권한 확인
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, role } = await request.json();

        if (!userId || !role || !['USER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // 자기 자신의 권한은 변경 불가
        if (userId === admin.id) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        // 권한 업데이트
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
