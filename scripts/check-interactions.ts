
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInteractions() {
    console.log("Checking UserSearchInteraction table...");

    const totalCount = await prisma.userSearchInteraction.count();
    console.log(`Total Interactions: ${totalCount}`);

    const breakdown = await prisma.userSearchInteraction.groupBy({
        by: ['type'],
        _count: {
            type: true
        }
    });

    console.log("Breakdown by Type:");
    breakdown.forEach(b => {
        console.log(`- ${b.type}: ${b._count.type}`);
    });

    const recent = await prisma.userSearchInteraction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { searchContent: { select: { title: true } } }
    });

    console.log("\nRecent 5 Interactions:");
    recent.forEach(i => {
        console.log(`[${i.createdAt.toISOString()}] ${i.type} on "${i.searchContent.title}" (Dwell: ${i.dwellTime}s)`);
    });
}

checkInteractions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
