import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { email: true, createdAt: true },
        });

        if (user) {
            return NextResponse.json({
                exists: true,
                message: `해당 이메일(${user.email})로 가입된 계정이 있습니다. (가입일: ${new Date(user.createdAt).toLocaleDateString()})`
            });
        } else {
            return NextResponse.json({
                exists: false,
                message: '해당 이메일로 가입된 계정이 없습니다.'
            });
        }
    } catch (error) {
        console.error('Find ID error:', error);
        return NextResponse.json(
            { error: '확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
