import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== CRÉATION DE L'ENTREPRISE ====================
  const company = await prisma.company.upsert({
    where: { name: 'ENTRESAAS Demo' },
    update: {},
    create: {
      name: 'ENTRESAAS Demo',
      taxId: 'DEMO123456',
      email: 'contact@entresaas.com',
      phone: '+250 788 123 456',
      address: 'Kigali, Rwanda',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Africa/Kigali',
    },
  });

  console.log(`✅ Company created: ${company.name}`);

  // ==================== CRÉATION DES RÔLES (avec upsert) ====================
  const adminRole = await prisma.role.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'ADMIN',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'ADMIN',
      description: 'Administrateur système - accès complet',
      isSystem: true,
      permissions: {
        users: { create: true, read: true, update: true, delete: true },
        roles: { create: true, read: true, update: true, delete: true },
        leave: { request: true, approve: true, configure: true },
        expense: { create: true, approve: true, configure: true },
        time: { view: true, viewTeam: true, configure: true },
        documents: { upload: true, viewSensitive: true, delete: true },
        tasks: { create: true, assign: true, delete: true },
        reports: { view: true, export: true },
        company: { configure: true },
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'MANAGER',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'MANAGER',
      description: "Manager d'équipe",
      isSystem: true,
      permissions: {
        users: { create: false, read: true, update: true, delete: false },
        leave: { request: true, approve: true, configure: false },
        expense: { create: true, approve: true, configure: false },
        time: { view: true, viewTeam: true, configure: false },
        documents: { upload: true, viewSensitive: false, delete: false },
        tasks: { create: true, assign: true, delete: false },
        reports: { view: true, export: false },
      },
    },
  });

  const userRole = await prisma.role.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'USER',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'USER',
      description: 'Employé standard',
      isSystem: true,
      permissions: {
        leave: { request: true, approve: false, configure: false },
        expense: { create: true, approve: false, configure: false },
        time: { view: true, viewTeam: false, configure: false },
        documents: { upload: true, viewSensitive: false, delete: false },
        tasks: { create: false, assign: false, delete: false },
      },
    },
  });

  console.log('✅ Roles created/verified');

  // ==================== CRÉATION DES DÉPARTEMENTS (avec upsert) ====================
  const deptDirection = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Direction',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Direction',
      description: 'Direction générale',
    },
  });

  const deptRH = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Ressources Humaines',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Ressources Humaines',
      description: 'RH',
    },
  });

  const deptIT = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Informatique',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Informatique',
      description: 'IT',
    },
  });

  const deptFinance = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Finance',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Finance',
      description: 'Comptabilité',
    },
  });

  console.log('✅ Departments created/verified');

  // ==================== CRÉATION DES UTILISATEURS (avec upsert) ====================
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@entresaas.com' },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@entresaas.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@entresaas.com' },
    update: {},
    create: {
      companyId: company.id,
      email: 'manager@entresaas.com',
      password: managerPassword,
      roleId: managerRole.id,
      isActive: true,
    },
  });

  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@entresaas.com' },
    update: {},
    create: {
      companyId: company.id,
      email: 'user@entresaas.com',
      password: userPassword,
      roleId: userRole.id,
      isActive: true,
    },
  });

  console.log('✅ Users created/verified');

  // ==================== CRÉATION DES TYPES DE CONGÉS (avec upsert) ====================
  const annualLeave = await prisma.leaveType.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'ANNUAL',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'ANNUAL',
      description: 'Congés payés',
      daysPerYear: 25,
      color: '#3b82f6',
    },
  });

  const sickLeave = await prisma.leaveType.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'SICK',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'SICK',
      description: 'Congés maladie',
      daysPerYear: null,
      color: '#ef4444',
    },
  });

  console.log('✅ Leave types created/verified');

  console.log('\n✅✅✅ SEED COMPLETÉ AVEC SUCCÈS ✅✅✅');
  console.log('═══════════════════════════════════════════');
  console.log('🏢 Entreprise: ENTRESAAS Demo');
  console.log('👑 ADMIN: admin@entresaas.com / Admin123!');
  console.log('👔 MANAGER: manager@entresaas.com / Manager123!');
  console.log('👤 USER: user@entresaas.com / User123!');
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
