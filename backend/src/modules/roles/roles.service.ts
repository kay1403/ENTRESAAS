import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  createRole(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: { name: dto.name, permissions: { connect: dto.permissionIds.map(id => ({ id })) } },
    });
  }

  updateRole(id: number, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: { name: dto.name, permissions: dto.permissionIds ? { set: dto.permissionIds.map(id => ({ id })) } : undefined },
    });
  }

  deleteRole(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.role.findMany({ include: { permissions: true } });
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  }
}
