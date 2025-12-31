
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const items = await prisma.searchContent.findMany({
        take: 20,
        select: { title: true, type: true, link: true }
    });
    console.log(JSON.stringify(items, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
