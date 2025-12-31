import { prisma } from '@/lib/prisma';
import SearchManagementClient from '@/components/admin/SearchManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminSearchPage() {
    // Fetch latest 50 items for inspection
    const searchContent = await prisma.searchContent.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: 50
    });

    return <SearchManagementClient initialContent={searchContent} />;
}
