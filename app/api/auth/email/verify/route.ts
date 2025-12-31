import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: '이메일과 인증 코드를 입력해주세요.' }, { status: 400 });
        }

        // VerificationToken 조회 (identifier = email, token = code)
        // 복합 유니크 키 또는 token 유니크 키 사용 가능
        const verification = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                expires: { gt: new Date() }, // 만료되지 않은 것
            },
        });

        if (!verification) {
            return NextResponse.json({ error: '유효하지 않거나 만료된 인증 코드입니다.' }, { status: 400 });
        }

        // 인증 성공 시 토큰 삭제 (일회용)
        // 주의: 회원가입 완료 전까지는 삭제하면 안 될 수도 있지만, 
        // 보통 인증 완료 -> 가입 요청 시점에 또 검증하거나, 
        // 클라이언트가 "인증됨" 상태를 믿고 가입 요청을 보낼 때 서버가 다시 확인할 방법이 필요함.
        // 여기서는 "인증 확인"만 하고 삭제하지 않음? 
        // 아니면 "인증됨" 응답을 주고, 가입 API에서 다시 코드를 보내서 검증하고 그때 삭제?
        // 가입 API에서 code를 같이 보내서 검증하는게 제일 안전함.
        // 따라서 여기서는 단순히 "유효한지 확인"만 하고 삭제는 하지 않음.
        // 또는 프론트엔드 확인용 API이므로 굳이 삭제 안 함.

        // 하지만 가입 시 "이미 인증된 이메일인가"를 어떻게 알지?
        // 가입 API 호출 시 code를 파라미터로 받아서 다시 findFirst로 검증하고 그때 delete 하는 게 정석.

        return NextResponse.json({ success: true, message: '이메일 인증이 확인되었습니다.' });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: '인증 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
