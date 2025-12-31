import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import * as z from 'zod';

const wikiSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    slug: z.string().min(1),
    category: z.enum(['UPDATE', 'MECHANIC', 'ITEM', 'ENTITY', 'GUIDE', 'RESOURCE']),
    excerpt: z.string().optional(),
    sourceUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Prisma.WikiDocWhereInput = {
        published: true,
    };

    if (category && category !== 'ALL') {
        where.category = category as any; // Cast to avoid complex enum validation logic here
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }

    try {
        const docs = await prisma.wikiDoc.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return NextResponse.json(docs);
    } catch (error) {
        console.error('Error fetching wiki docs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wiki docs' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // AI 생성기나 관리자만 생성 가능하도록 권한 체크 필요
    // 현재는 로그인한 유저라면 생성 가능하게 임시 허용 (추후 Admin 체크 추가)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = wikiSchema.parse(json);

        // slug 중복 체크
        const existing = await prisma.wikiDoc.findUnique({
            where: { slug: body.slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 409 }
            );
        }

        const doc = await prisma.wikiDoc.create({
            data: {
                ...body,
                published: true,
            },
        });

        return NextResponse.json(doc);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error('Error creating wiki doc:', error);
        return NextResponse.json(
            { error: 'Failed to create wiki doc' },
            { status: 500 }
        );
    }
}
