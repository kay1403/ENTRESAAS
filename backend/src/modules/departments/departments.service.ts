import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        managerId: dto.managerId,
      },
      include: {
        manager: {
          select: { id: true, email: true },
        },
      },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.department.findMany({
      where: { companyId, deletedAt: null },
      include: {
        manager: {
          select: { id: true, email: true },
        },
        employees: {
          select: { id: true },
        },
      },
    });
  }

  async findOne(id: number, companyId: number) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        manager: {
          select: { id: true, email: true },
        },
        employees: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Département non trouvé');
    }

    return department;
  }

  async update(id: number, companyId: number, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException('Département non trouvé');
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        manager: {
          select: { id: true, email: true },
        },
      },
    });
  }

  async remove(id: number, companyId: number) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException('Département non trouvé');
    }

    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
