import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: '$2b$10$hashedpassword', // bcrypt hash
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log({ adminRole, admin });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
