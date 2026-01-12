import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { ContentAnalyzer } from '@/lib/content-analyzer';

const resourceSchema = z.object({
    title: z.string().min(1, '제목을 입력해주세요'),
    description: z.string().optional(),
    category: z.enum(['MOD', 'SKIN', 'MAP', 'PLUGIN', 'TEXTURE', 'DATAPACK', 'ADDON', 'SEED', 'SERVERPACK']),
    fileUrl: z.string().url('올바른 URL을 입력해주세요'),
    thumbnail: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
    version: z.string().optional(),
    tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subCategory = searchParams.get('subCategory');
        const search = searchParams.get('search');
        const verified = searchParams.get('verified') === 'true';
        const version = searchParams.get('version');
        // const minRating = Number(searchParams.get('minRating')) || 0; // Not implementing minRating yet as agreed

        const resources = await prisma.resource.findMany({
            where: {
                ...(category && category !== 'ALL' ? { category: category as any } : {}),
                ...(subCategory && subCategory !== 'ALL' ? { subCategory } : {}),
                ...(verified ? { isVerified: true } : {}),
                ...(version ? { supportedVersion: { contains: version } } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Failed to fetch resources:', error);
        return NextResponse.json(
            { error: '자료 목록을 불러오는데 실패했습니다' },
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
        const validatedData = resourceSchema.parse(body);

        // Analyze Content
        const description = validatedData.description || '';
        const readability = ContentAnalyzer.calculateReadability(description);
        const length = ContentAnalyzer.calculateLength(description);

        // Transactional creation
        const [resource] = await prisma.$transaction(async (tx) => {
            const newResource = await tx.resource.create({
                data: {
                    ...validatedData,
                    userId: session.user.id,
                    thumbnail: validatedData.thumbnail || null,
                },
            });

            // Sync to SearchContent
            await tx.searchContent.create({
                data: {
                    type: 'RESOURCE',
                    title: newResource.title,
                    description: newResource.description || '',
                    tags: newResource.tags,
                    thumbnail: newResource.thumbnail,
                    link: `/resources/${newResource.id}`,
                    resourceId: newResource.id,
                    // Metrics
                    viewCount: 0,
                    likeCount: 0,
                    contentLength: length,
                    readabilityScore: readability,
                    lastActive: new Date(),
                }
            });
            //...

            // Sync Tags to Tag model (Upsert)
            if (newResource.tags && newResource.tags.length > 0) {
                for (const tagName of newResource.tags) {
                    await tx.tag.upsert({
                        where: { name: tagName },
                        update: { count: { increment: 1 } },
                        create: { name: tagName, count: 1 }
                    });
                }
            }

            return [newResource];
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        console.error('Failed to create resource:', error);
        return NextResponse.json(
            { error: '자료 등록에 실패했습니다' },
            { status: 500 }
        );
    }
}
