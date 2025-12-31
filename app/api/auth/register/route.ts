import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

export async function POST(req: Request) {
    try {
        const { name, email, password, code, isAgreed } = await req.json();

        if (!name || !email || !password || !code) {
            return NextResponse.json(
                { error: '모든 필드를 입력해 주세요.' },
                { status: 400 }
            );
        }

        if (!isAgreed) {
            return NextResponse.json(
                { error: '이용약관 및 개인정보 수집에 동의해야 합니다.' },
                { status: 400 }
            );
        }

        // 이메일 인증 코드 최종 검증
        const verification = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() },
            },
        });

        if (!verification) {
            return NextResponse.json(
                { error: '이메일 인증이 완료되지 않았거나 만료되었습니다. 다시 인증해주세요.' },
                { status: 400 }
            );
        }

        // 이미 가입된 이메일인지 확인
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: '이미 사용 중인 이메일입니다.' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // 인증 토큰 삭제 (사용 완료)
        await prisma.verificationToken.delete({
            where: { token: code }, // token이 unique이므로 바로 삭제 가능
        });

        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        console.error('Failed to register user:', error);
        return NextResponse.json(
            { error: '회원가입에 실패했습니다' },
            { status: 500 }
        );
    }
}
