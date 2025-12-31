const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdmin() {
    try {
        const user = await prisma.user.update({
            where: { email: 'maxnsoo@naver.com' },
            data: { role: 'ADMIN' },
        });

        console.log('✅ 관리자 권한이 부여되었습니다!');
        console.log('📧 Email:', user.email);
        console.log('👤 Name:', user.name);
        console.log('👑 Role:', user.role);
    } catch (error) {
        console.error('❌ 오류:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setAdmin();
