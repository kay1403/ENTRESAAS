import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createRole(dto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: { 
        name: dto.name, 
        permissions: { connect: dto.permissionIds.map(id => ({ id })) } 
      },
    });
    
    await this.cacheService.clearRolesCache();
    return role;
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: { 
        name: dto.name, 
        permissions: dto.permissionIds ? { set: dto.permissionIds.map(id => ({ id })) } : undefined 
      },
    });
    
    await this.cacheService.clearRolesCache();
    await this.cacheService.del(`roles:${id}`);
    return role;
  }

  async deleteRole(id: number) {
    const role = await this.prisma.role.delete({ where: { id } });
    await this.cacheService.clearRolesCache();
    await this.cacheService.del(`roles:${id}`);
    return role;
  }

  async findAll() {
    const cached = await this.cacheService.getRoles();
    if (cached) {
      console.log('📦 Rôles servis depuis le cache');
      return cached;
    }

    console.log('🔄 Rôles servis depuis la base de données');
    const roles = await this.prisma.role.findMany({ 
      include: { permissions: true } 
    });
    
    await this.cacheService.setRoles(roles);
    return roles;
  }

  async findOne(id: number) {
    const cached = await this.cacheService.get(`roles:${id}`);
    if (cached) {
      console.log(`📦 Rôle ${id} servi depuis le cache`);
      return cached;
    }

    console.log(`🔄 Rôle ${id} servi depuis la base de données`);
    const role = await this.prisma.role.findUnique({ 
      where: { id }, 
      include: { permissions: true } 
    });
    
    if (role) {
      await this.cacheService.set(`roles:${id}`, role, 120);
    }
    
    return role;
  }
}
