import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
        const tags = await prisma.tag.findMany({
            where: query ? {
                name: { contains: query, mode: 'insensitive' }
            } : {},
            orderBy: {
                count: 'desc'
            },
            take: limit
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}
