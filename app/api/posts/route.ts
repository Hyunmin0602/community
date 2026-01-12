import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as z from 'zod';
import { ContentAnalyzer } from '@/lib/content-analyzer';

const postSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    content: z.string().min(1, 'Content is required'),
    category: z.enum(['FREE', 'QUESTION', 'TIP', 'NOTICE']),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') {
        where.category = category;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }

    try {
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            image: true,
                            id: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        return NextResponse.json({
            posts,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = postSchema.parse(json);

        // Analyze Content
        const readability = ContentAnalyzer.calculateReadability(body.content);
        const length = ContentAnalyzer.calculateLength(body.content);

        // Transactional creation of Post and SearchContent
        const [post] = await prisma.$transaction(async (tx) => {
            const newPost = await tx.post.create({
                data: {
                    title: body.title,
                    content: body.content,
                    category: body.category,
                    userId: session.user.id,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            image: true
                        }
                    }
                }
            });

            // Create SearchContent within the same transaction
            await tx.searchContent.create({
                data: {
                    type: 'POST',
                    title: newPost.title,
                    description: newPost.content.slice(0, 200), // Summary
                    link: `/forum/posts/${newPost.id}`,
                    postId: newPost.id,
                    viewCount: 0,
                    likeCount: 0,
                    contentLength: length,
                    readabilityScore: readability,
                    lastActive: new Date(),
                    // Default values for grades
                    trustGrade: 'B',
                    accuracyGrade: 'B',
                    relevanceGrade: 'B',
                }
            });

            return [newPost];
        });

        return NextResponse.json(post);
    } catch (error) {
        //...
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
