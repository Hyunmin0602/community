import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const interactionSchema = z.object({
    searchContentId: z.string().min(1),
    type: z.enum(['VIEW', 'CLICK', 'LIKE', 'SHARE', 'BOUNCE']),
    dwellTime: z.number().optional().default(0),
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    try {
        const body = await req.json();
        const { searchContentId, type, dwellTime } = interactionSchema.parse(body);

        // Log interaction
        await prisma.userSearchInteraction.create({
            data: {
                searchContentId,
                userId,
                type,
                dwellTime,
            }
        });

        // Update analytics counters on SearchContent (Async, fire and forget style usually, but here we await for safety)
        if (type === 'CLICK') {
            await prisma.searchContent.update({
                where: { id: searchContentId },
                data: { clicks: { increment: 1 } }
            });
        }
        if (type === 'VIEW') {
            await prisma.searchContent.update({
                where: { id: searchContentId },
                data: { impressions: { increment: 1 } }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Interaction logging failed:', error);
        // Fail silently to not impact user experience
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
