import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resource = await prisma.resource.update({
            where: { id: params.id },
            data: {
                downloadCount: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ downloadCount: resource.downloadCount });
    } catch (error) {
        console.error('Failed to increment download count:', error);
        return NextResponse.json(
            { error: '다운로드 카운트 업데이트에 실패했습니다' },
            { status: 500 }
        );
    }
}
