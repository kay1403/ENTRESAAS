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

  // ==================== CRÉATION DES RÔLES ====================
  const adminRole = await prisma.role.create({
    data: {
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

  const managerRole = await prisma.role.create({
    data: {
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

  const userRole = await prisma.role.create({
    data: {
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

  console.log('✅ Roles created');

  // ==================== CRÉATION DES DÉPARTEMENTS ====================
  const deptDirection = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Direction',
      description: 'Direction générale',
    },
  });

  const deptRH = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Ressources Humaines',
      description: 'RH',
    },
  });

  const deptIT = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Informatique',
      description: 'IT',
    },
  });

  const deptFinance = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Finance',
      description: 'Comptabilité',
    },
  });

  // ==================== CRÉATION DES UTILISATEURS ====================
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@entresaas.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
      employeeInfo: {
        create: {
          companyId: company.id,
          firstName: 'Admin',
          lastName: 'System',
          employeeId: 'EMP001',
          departmentId: deptDirection.id,
          position: 'Administrateur système',
          hireDate: new Date('2024-01-01'),
        },
      },
    },
  });

  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'manager@entresaas.com',
      password: managerPassword,
      roleId: managerRole.id,
      isActive: true,
      employeeInfo: {
        create: {
          companyId: company.id,
          firstName: 'Manager',
          lastName: 'Team',
          employeeId: 'EMP002',
          departmentId: deptIT.id,
          position: 'Chef de projet',
          hireDate: new Date('2024-01-15'),
          managerId: admin.id,
        },
      },
    },
  });

  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'user@entresaas.com',
      password: userPassword,
      roleId: userRole.id,
      isActive: true,
      employeeInfo: {
        create: {
          companyId: company.id,
          firstName: 'User',
          lastName: 'Standard',
          employeeId: 'EMP003',
          departmentId: deptIT.id,
          position: 'Développeur',
          hireDate: new Date('2024-02-01'),
          managerId: manager.id,
        },
      },
    },
  });

  // Mise à jour du manager du département
  await prisma.department.update({
    where: { id: deptIT.id },
    data: { managerId: manager.id },
  });

  console.log('✅ Users created');

  // ==================== CRÉATION DES TYPES DE CONGÉS ====================
  const annualLeave = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'ANNUAL',
      description: 'Congés payés',
      daysPerYear: 25,
      color: '#3b82f6',
    },
  });

  const sickLeave = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'SICK',
      description: 'Congés maladie',
      daysPerYear: null,
      color: '#ef4444',
    },
  });

  const maternityLeave = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'MATERNITY',
      description: 'Congé maternité',
      daysPerYear: 98,
      color: '#ec4899',
    },
  });

  const paternityLeave = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'PATERNITY',
      description: 'Congé paternité',
      daysPerYear: 4,
      color: '#8b5cf6',
    },
  });

  const unpaidLeave = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'UNPAID',
      description: 'Congé sans solde',
      daysPerYear: null,
      paid: false,
      color: '#6b7280',
    },
  });

  // ==================== CRÉATION DES SOLDES DE CONGÉS ====================
  const currentYear = new Date().getFullYear();
  
  await prisma.leaveBalance.createMany({
    data: [
      {
        userId: admin.id,
        leaveTypeId: annualLeave.id,
        year: currentYear,
        totalDays: 25,
        usedDays: 3,
        pendingDays: 2,
      },
      {
        userId: manager.id,
        leaveTypeId: annualLeave.id,
        year: currentYear,
        totalDays: 25,
        usedDays: 5,
        pendingDays: 3,
      },
      {
        userId: user.id,
        leaveTypeId: annualLeave.id,
        year: currentYear,
        totalDays: 25,
        usedDays: 0,
        pendingDays: 5,
      },
      {
        userId: user.id,
        leaveTypeId: sickLeave.id,
        year: currentYear,
        totalDays: 10,
        usedDays: 2,
        pendingDays: 0,
      },
    ],
  });

  // ==================== CRÉATION DES TYPES DE DÉPENSES ====================
  const transportCat = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: 'TRANSPORT',
      description: 'Frais de transport',
      dailyCap: 50,
      requiresReceipt: true,
    },
  });

  const mealCat = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: 'MEAL',
      description: 'Frais de repas',
      dailyCap: 20,
      requiresReceipt: true,
    },
  });

  const hotelCat = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: 'HOTEL',
      description: "Frais d'hôtel",
      dailyCap: 150,
      requiresReceipt: true,
    },
  });

  const otherCat = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: 'OTHER',
      description: 'Autres frais',
      dailyCap: null,
      requiresReceipt: true,
    },
  });

  // ==================== CRÉATION DES DEMANDES DE CONGÉS EXEMPLES ====================
  await prisma.leaveRequest.createMany({
    data: [
      {
        companyId: company.id,
        userId: user.id,
        leaveTypeId: annualLeave.id,
        startDate: new Date(currentYear, 4, 10), // 10 mai
        endDate: new Date(currentYear, 4, 15),   // 15 mai
        daysCount: 5,
        reason: 'Vacances familiales',
        status: 'APPROVED',
        approvedById: manager.id,
        approvedAt: new Date(currentYear, 3, 25),
      },
      {
        companyId: company.id,
        userId: user.id,
        leaveTypeId: annualLeave.id,
        startDate: new Date(currentYear, 6, 1),  // 1 juillet
        endDate: new Date(currentYear, 6, 3),    // 3 juillet
        daysCount: 2,
        reason: 'Week-end prolongé',
        status: 'PENDING',
      },
      {
        companyId: company.id,
        userId: manager.id,
        leaveTypeId: annualLeave.id,
        startDate: new Date(currentYear, 7, 15), // 15 août
        endDate: new Date(currentYear, 7, 25),   // 25 août
        daysCount: 10,
        reason: "Vacances d'été",
        status: 'APPROVED',
        approvedById: admin.id,
        approvedAt: new Date(currentYear, 6, 1),
      },
    ],
  });

  // ==================== CRÉATION DE POINTAGES EXEMPLES ====================
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.timeEntry.createMany({
    data: [
      {
        companyId: company.id,
        userId: user.id,
        type: 'CHECK_IN',
        timestamp: new Date(today.setHours(8, 5, 0)),
        workDate: today,
      },
      {
        companyId: company.id,
        userId: user.id,
        type: 'CHECK_OUT',
        timestamp: new Date(today.setHours(17, 30, 0)),
        workDate: today,
      },
    ],
  });

  // ==================== CRÉATION DE NOTIFICATIONS EXEMPLES ====================
  await prisma.notification.createMany({
    data: [
      {
        companyId: company.id,
        userId: user.id,
        type: 'LEAVE_APPROVED',
        title: 'Congés approuvés',
        message: 'Votre demande de congés du 10 au 15 mai a été approuvée',
        link: '/leave/requests/1',
        priority: 'INFO',
      },
      {
        companyId: company.id,
        userId: manager.id,
        type: 'LEAVE_REQUEST',
        title: 'Nouvelle demande de congés',
        message: 'User Standard a demandé 2 jours de congés',
        link: '/leave/requests/2',
        priority: 'IMPORTANT',
      },
    ],
  });

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
