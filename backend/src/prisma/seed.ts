import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users:read' },
      update: {},
      create: { name: 'users:read' },
    }),
    prisma.permission.upsert({
      where: { name: 'users:write' },
      update: {},
      create: { name: 'users:write' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:read' },
      update: {},
      create: { name: 'roles:read' },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:write' },
      update: {},
      create: { name: 'roles:write' },
    }),
  ]);

  // Create admin role with all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });

  // Create user role with read permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: {
        connect: permissions
          .filter(p => p.name.includes('read'))
          .map(p => ({ id: p.id })),
      },
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@example.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });