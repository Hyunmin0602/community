import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { searchContentId, query, userId } = body;

        if (!searchContentId) {
            return NextResponse.json({ error: 'Missing searchContentId' }, { status: 400 });
        }

        // 1. Increment Clicks
        await prisma.searchContent.update({
            where: { id: searchContentId },
            data: {
                clicks: { increment: 1 }
            }
        });

        // 2. Log Query Interaction (if query tracking is enabled)
        // We find the recent log for this query and update it, or create a new one?
        // Ideally we associate this click with a specific SearchQueryLog ID if passed, 
        // but for simplicity let's just create a log entry if needed, or skip complex log linking for now.
        // Or if we want to track conversion rate per query log, we need the `logId`.

        // For MVP: We just track the click on the content.
        // If query is provided, we can log a "Click Event" separately or update the log.
        // Let's keep it simple: Just increment click count on content.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Search Track Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
