import { prisma } from '../lib/prisma';

async function testConnection() {
    console.log('Testing database connection...');

    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database connected successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
