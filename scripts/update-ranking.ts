
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRanking() {
    console.log(`[${new Date().toISOString()}] Starting Daily Ranking Update...`);

    // 1. Define window (Last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    console.log(`Fetching interactions since ${yesterday.toISOString()}...`);

    // 2. Aggregate interactions to find active content AND calculate quality adjustments
    const interactions = await prisma.userSearchInteraction.findMany({
        where: { createdAt: { gte: yesterday } },
        include: { user: { select: { trustScore: true } } }
    });

    console.log(`Fetched ${interactions.length} interactions for analysis.`);

    const stats: Record<string, {
        lastActive: Date;
        decrementClicks: number;
        validInteractions: number;
    }> = {};

    for (const log of interactions) {
        if (!log.searchContentId) continue;

        if (!stats[log.searchContentId]) {
            stats[log.searchContentId] = {
                lastActive: log.createdAt,
                decrementClicks: 0,
                validInteractions: 0
            };
        }

        const stat = stats[log.searchContentId];
        // Tracking Max LastActive
        if (log.createdAt > stat.lastActive) {
            stat.lastActive = log.createdAt;
        }

        // --- Anti-Abuse Logic ---

        // 1. Dwell Time Filtering (Bounce)
        // If dwellTime is less than 3 seconds, we consider it a bounce (invalid click).
        // Since the real-time API incremented the count, we must decrement it back.
        if (log.dwellTime < 3) {
            stat.decrementClicks += 1;
            continue; // Skip further processing
        }

        // 2. Trust Score Weighting
        // Users with low trust score (< 30) have reduced impact.
        // We decrement 0.9 click for every 1 click (Effectively 0.1 weight)
        const trustScore = log.user?.trustScore ?? 50; // Default 50

        if (trustScore < 30) {
            stat.decrementClicks += 0.9;
        }
        // Note: We don't increment for High Trust here because 'clicks' is a counter.
        // High Trust bonus is applied in Scoring Logic (calculateBaseScore) via User Trust Bonus, not click count.

        stat.validInteractions++;
    }

    console.log(`Analyzed ${Object.keys(stats).length} active items for quality adjustment.`);

    let updatedCount = 0;

    // 3. Update SearchContent
    for (const [id, stat] of Object.entries(stats)) {
        try {
            // Fetch current to compare lastActive
            const content = await prisma.searchContent.findUnique({
                where: { id },
                select: { lastActive: true, clicks: true }
            });

            if (!content) continue;

            const updateData: any = {};

            // Update lastActive if newer
            if (content.lastActive < stat.lastActive) {
                updateData.lastActive = stat.lastActive;
            }

            // Apply Click Correction (Decrement bad clicks)
            // Ensure we don't drop below zero
            if (stat.decrementClicks > 0) {
                const newClicks = Math.max(0, Math.floor(content.clicks - stat.decrementClicks));
                if (newClicks !== content.clicks) {
                    updateData.clicks = newClicks;
                    // console.log(`[Correction] Item ${id}: Decremented ${stat.decrementClicks.toFixed(1)} clicks (Abuse/Bounce)`);
                }
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.searchContent.update({
                    where: { id },
                    data: updateData
                });
                updatedCount++;
            }

        } catch (e) {
            console.error(`Failed to update content ${id}`, e);
        }
    }
}

updateRanking()
    .catch(e => {
        console.error("Ranking update failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
