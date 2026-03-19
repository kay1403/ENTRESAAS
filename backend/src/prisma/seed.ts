// src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== CRÉATION DES PERMISSIONS ====================
  const permissions = await Promise.all([
    // Users
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
      where: { name: 'users:delete' },
      update: {},
      create: { name: 'users:delete' },
    }),
    
    // Roles
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
    prisma.permission.upsert({
      where: { name: 'roles:delete' },
      update: {},
      create: { name: 'roles:delete' },
    }),
    
    // Permissions
    prisma.permission.upsert({
      where: { name: 'permissions:read' },
      update: {},
      create: { name: 'permissions:read' },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions:write' },
      update: {},
      create: { name: 'permissions:write' },
    }),
    
    // Audit
    prisma.permission.upsert({
      where: { name: 'audit:read' },
      update: {},
      create: { name: 'audit:read' },
    }),
    
    // Export
    prisma.permission.upsert({
      where: { name: 'export:data' },
      update: {},
      create: { name: 'export:data' },
    }),
    
    // 2FA
    prisma.permission.upsert({
      where: { name: '2fa:manage' },
      update: {},
      create: { name: '2fa:manage' },
    }),
  ]);

  console.log('✅ Permissions created');

  // ==================== CRÉATION DES RÔLES ====================

  // ADMIN - toutes les permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: {
        set: permissions.map(p => ({ id: p.id })),
      },
    },
    create: {
      name: 'ADMIN',
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });

  // MANAGER - permissions de lecture + export
  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {
      permissions: {
        set: permissions
          .filter(p => 
            p.name.includes('read') || 
            p.name === 'export:data' ||
            p.name === 'users:write'
          )
          .map(p => ({ id: p.id })),
      },
    },
    create: {
      name: 'MANAGER',
      permissions: {
        connect: permissions
          .filter(p => 
            p.name.includes('read') || 
            p.name === 'export:data' ||
            p.name === 'users:write'
          )
          .map(p => ({ id: p.id })),
      },
    },
  });

  // USER - seulement lecture de base
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {
      permissions: {
        set: permissions
          .filter(p => p.name === 'users:read' || p.name === '2fa:manage')
          .map(p => ({ id: p.id })),
      },
    },
    create: {
      name: 'USER',
      permissions: {
        connect: permissions
          .filter(p => p.name === 'users:read' || p.name === '2fa:manage')
          .map(p => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Roles created');
  console.log('   - ADMIN: toutes les permissions');
  console.log('   - MANAGER: lecture + export');
  console.log('   - USER: lecture de base + 2FA');

  // ==================== CRÉATION DES UTILISATEURS ====================

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      roleId: adminRole.id,
    },
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Manager user
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {
      roleId: managerRole.id,
    },
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      roleId: managerRole.id,
      isActive: true,
    },
  });

  // Regular user
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      roleId: userRole.id,
    },
    create: {
      email: 'user@example.com',
      password: userPassword,
      roleId: userRole.id,
      isActive: true,
    },
  });

  // Test user (optionnel)
  const testPassword = await bcrypt.hash('Test123!', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      roleId: userRole.id,
    },
    create: {
      email: 'test@example.com',
      password: testPassword,
      roleId: userRole.id,
      isActive: true,
    },
  });

  console.log('✅ Users created');
  console.log('   - admin@example.com / Admin123! (ADMIN)');
  console.log('   - manager@example.com / Manager123! (MANAGER)');
  console.log('   - user@example.com / User123! (USER)');
  console.log('   - test@example.com / Test123! (USER)');

  // ==================== CRÉATION DE LOGS D'AUDIT EXEMPLES ====================
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (admin) {
    await prisma.auditLog.createMany({
      data: [
        {
          action: 'USER_LOGIN',
          userId: admin.id,
          ip: '192.168.1.100',
          payload: { success: true, timestamp: new Date().toISOString() },
        },
        {
          action: 'USER_CREATED',
          userId: admin.id,
          ip: '192.168.1.100',
          payload: { userId: 2, email: 'user@example.com' },
        },
        {
          action: 'ROLE_UPDATED',
          userId: admin.id,
          ip: '192.168.1.100',
          payload: { roleId: 2, changes: 'permissions updated' },
        },
      ],
    });
  }

  console.log('✅ Sample audit logs created');

  console.log('\n📊 Database seeded successfully!');
  console.log('═══════════════════════════════════════════');
  console.log('🚀 Application ready to use!');
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
