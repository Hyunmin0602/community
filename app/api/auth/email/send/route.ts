import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
        }

        // 이미 가입된 이메일인지 확인 (회원가입 용도일 경우 중복 체크)
        // const existingUser = await prisma.user.findUnique({ where: { email } });
        // if (existingUser) {
        //     return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 400 });
        // }
        // -> 회원가입 페이지에서 호출할 것이므로 중복 체크는 선택적. 
        // 하지만 "아이디 찾기"나 "비번 찾기"에서도 이메일 발송을 쓸 수 있으므로, 
        // 여기서는 순수하게 "인증 코드 발송"만 담당하거나, type 파라미터를 받는 게 좋음.
        // 일단 단순하게 코드 발송만 수행.

        // 6자리 랜덤 코드 생성 및 중복 체크
        let code = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            code = crypto.randomInt(100000, 999999).toString();
            // 해당 코드가 이미 존재하는지 확인 (VerificationToken의 token은 unique)
            const existingToken = await prisma.verificationToken.findUnique({
                where: { token: code },
            });
            if (!existingToken) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json({ error: '일시적인 오류입니다. 다시 시도해주세요.' }, { status: 500 });
        }

        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        // 기존 해당 이메일의 인증 정보 삭제 (identifier가 email 역할)
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: code,
                expires,
            },
        });

        // 이메일 전송
        await sendVerificationEmail(email, code);

        return NextResponse.json({ success: true, message: '인증 코드가 전송되었습니다.' });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: '이메일 전송 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
