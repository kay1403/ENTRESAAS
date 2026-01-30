import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  createPermission(dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }

  updatePermission(id: number, dto: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  deletePermission(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.permission.findMany();
  }

  findOne(id: number) {
    return this.prisma.permission.findUnique({ where: { id } });
  }
}
