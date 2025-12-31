import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: '모든 필드를 입력해 주세요.' }, { status: 400 });
        }

        // 1. 인증 코드 검증
        const verification = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() },
            },
        });

        if (!verification) {
            return NextResponse.json({ error: '유효하지 않거나 만료된 인증 코드입니다.' }, { status: 400 });
        }

        // 2. 사용자 존재 여부 확인
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: '가입되지 않은 이메일입니다.' }, { status: 404 });
        }

        // 3. 비밀번호 업데이트
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // 4. 사용된 토큰 삭제
        await prisma.verificationToken.delete({
            where: { token: code },
        });

        return NextResponse.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: '비밀번호 변경 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
