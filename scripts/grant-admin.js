const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = 'maxnsoo@naver.com';
    console.log(`[JS] Granting ADMIN role to ${email}...`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('[JS] User not found!');
            return;
        }
        console.log('[JS] User found:', user.id, user.role);

        const updated = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log('[JS] Success! User updated:', updated);
    } catch (error) {
        console.error('[JS] Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
