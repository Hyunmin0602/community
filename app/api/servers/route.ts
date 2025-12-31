import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const serverSchema = z.object({
    name: z.string().min(1, '서버 이름을 입력해주세요'),
    description: z.string().optional(),
    host: z.string().min(1, '서버 주소를 입력해주세요'),
    port: z.number().min(1).max(65535, '올바른 포트 번호를 입력해주세요'),
    type: z.enum(['JAVA', 'BEDROCK']),
    version: z.string().optional(),
    banner: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
    website: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
    discord: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
    tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const servers = await prisma.server.findMany({
            where: {
                ...(type && type !== 'ALL' ? { type: type as 'JAVA' | 'BEDROCK' } : {}),
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                _count: {
                    select: { votes: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.error('Failed to fetch servers:', error);
        return NextResponse.json(
            { error: '서버 목록을 불러오는데 실패했습니다' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = serverSchema.parse(body);

        const server = await prisma.server.create({
            data: {
                ...validatedData,
                userId: session.user.id,
                // 빈 문자열을 null로 변환
                banner: validatedData.banner || null,
                website: validatedData.website || null,
                discord: validatedData.discord || null,
            },
        });

        // SearchContent 자동 동기화
        await prisma.searchContent.create({
            data: {
                type: 'SERVER',
                title: server.name,
                description: server.description || '',
                thumbnail: server.icon,
                link: `/servers/${server.id}`,
                serverId: server.id,

                // 기본 가중치
                trustGrade: 'B',
                accuracyGrade: 'B',
                relevanceGrade: 'B',

                tags: server.tags,
                viewCount: 0,
            }
        });

        return NextResponse.json(server, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        console.error('Failed to create server:', error);
        return NextResponse.json(
            { error: '서버 등록에 실패했습니다' },
            { status: 500 }
        );
    }
}
