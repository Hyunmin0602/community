import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const doc = await prisma.wikiDoc.findUnique({
            where: { slug: params.slug },
        });

        if (!doc) {
            return NextResponse.json({ error: 'Wiki doc not found' }, { status: 404 });
        }

        return NextResponse.json(doc);
    } catch (error) {
        console.error('Error fetching wiki doc:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wiki doc' },
            { status: 500 }
        );
    }
}
