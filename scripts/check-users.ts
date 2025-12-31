import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');
    try {
        const users = await prisma.user.findMany();
        console.log('Found users:', users.length);
        users.forEach(u => console.log(`- ${u.email} (${u.name}) [${u.role}]`));

        const targetEmail = 'maxnsoo@naver.com';
        const target = users.find(u => u.email === targetEmail);

        if (target) {
            console.log(`\nTarget user found: ${target.id}`);
            // Try update again here to be sure
            const updated = await prisma.user.update({
                where: { email: targetEmail },
                data: { role: 'ADMIN' }
            });
            console.log('Update attempted directly during check:', updated);
        } else {
            console.log(`\nTARGET USER ${targetEmail} NOT FOUND!`);
        }

    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
