
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('User List:', users.map(u => ({ email: u.email, name: u.name, role: u.role })));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
