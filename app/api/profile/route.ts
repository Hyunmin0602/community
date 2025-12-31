import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const file = formData.get('image') as File | null;

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: '이름은 2글자 이상이어야 합니다.' }, { status: 400 });
        }

        let imageUrl = undefined;

        // 파일 업로드 처리
        if (file && file.size > 0) {
            // 이미지 검증 (간단히)
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
            }

            // 5MB 제한
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 파일명 생성 (충돌 방지)
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

            // 디렉토리 확인 및 생성
            const uploadDir = join(process.cwd(), 'public/uploads/avatars');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // Ignore if exists
            }

            const path = join(uploadDir, filename);
            await writeFile(path, buffer);
            imageUrl = `/uploads/avatars/${filename}`;
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: name.trim(),
                ...(imageUrl && { image: imageUrl }) // 이미지가 있을 때만 업데이트
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
