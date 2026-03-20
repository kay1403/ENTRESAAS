import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, dto: CreateEmployeeDto) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, companyId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    // Vérifier que l'employé n'existe pas déjà
    const existing = await this.prisma.employeeInfo.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new BadRequestException('Cet utilisateur a déjà un profil employé');
    }

    // Générer un employeeId unique
    const employeeId = `EMP${String(dto.userId).padStart(3, '0')}`;

    return this.prisma.employeeInfo.create({
      data: {
        userId: dto.userId,
        companyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        position: dto.position,
        departmentId: dto.departmentId,
        managerId: dto.managerId,
        hireDate: new Date(dto.hireDate),
        status: dto.status || 'ACTIVE',
        employeeId,
      },
      include: {
        user: { select: { id: true, email: true } },
        department: true,
        manager: { select: { id: true, email: true } },
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.employeeInfo.findMany({
      where: { companyId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
        department: true,
        manager: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, companyId: number) {
    const employee = await this.prisma.employeeInfo.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
        department: true,
        manager: { select: { id: true, email: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    return employee;
  }

  async update(id: number, companyId: number, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employeeInfo.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    const data: any = { ...dto };
    if (dto.hireDate) data.hireDate = new Date(dto.hireDate);
    if (dto.terminationDate) data.terminationDate = new Date(dto.terminationDate);

    return this.prisma.employeeInfo.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true } },
        department: true,
        manager: { select: { id: true, email: true } },
      },
    });
  }

  async remove(id: number, companyId: number) {
    const employee = await this.prisma.employeeInfo.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    return this.prisma.employeeInfo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByDepartment(departmentId: number, companyId: number) {
    return this.prisma.employeeInfo.findMany({
      where: { departmentId, companyId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }

  async findByManager(managerId: number, companyId: number) {
    return this.prisma.employeeInfo.findMany({
      where: { managerId, companyId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }
}
