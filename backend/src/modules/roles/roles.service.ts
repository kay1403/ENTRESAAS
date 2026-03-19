import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createRole(dto: CreateRoleDto, companyId: number) {
    // Structure de permissions par défaut si non fournie
    const defaultPermissions = dto.permissions || {
      users: { read: false, create: false, update: false, delete: false },
      roles: { read: false, create: false, update: false, delete: false },
      leave: { request: false, approve: false, configure: false },
      expense: { create: false, approve: false, configure: false },
      time: { view: false, viewTeam: false, configure: false },
      documents: { upload: false, viewSensitive: false, delete: false },
      tasks: { create: false, assign: false, delete: false },
    };

    const role = await this.prisma.role.create({
      data: { 
        name: dto.name,
        description: dto.description || 'Rôle personnalisé',
        companyId,
        permissions: defaultPermissions,
      },
    });
    
    await this.cacheService.clearRolesCache();
    return role;
  }

  async updateRole(id: number, dto: UpdateRoleDto, companyId: number) {
    const role = await this.prisma.role.findFirst({
      where: { 
        id,
        companyId,
      },
    });

    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.description) data.description = dto.description;
    if (dto.permissions) data.permissions = dto.permissions;

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data,
    });
    
    await this.cacheService.clearRolesCache();
    await this.cacheService.del(`roles:${id}`);
    return updatedRole;
  }

  async deleteRole(id: number, companyId: number) {
    const role = await this.prisma.role.findFirst({
      where: { 
        id,
        companyId,
      },
    });

    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }

    if (role.isSystem) {
      throw new BadRequestException('Impossible de supprimer un rôle système');
    }

    const deletedRole = await this.prisma.role.delete({ 
      where: { id },
    });
    
    await this.cacheService.clearRolesCache();
    await this.cacheService.del(`roles:${id}`);
    return deletedRole;
  }

  async findAll(companyId: number) {
    const cached = await this.cacheService.getRoles();
    if (cached) {
      console.log('📦 Rôles servis depuis le cache');
      return cached;
    }

    console.log('🔄 Rôles servis depuis la base de données');
    const roles = await this.prisma.role.findMany({ 
      where: { companyId },
    });
    
    await this.cacheService.setRoles(roles);
    return roles;
  }

  async findOne(id: number, companyId: number) {
    const cached = await this.cacheService.getRoleById(id);
    if (cached && cached.companyId === companyId) {
      console.log(`📦 Rôle ${id} servi depuis le cache`);
      return cached;
    }

    console.log(`🔄 Rôle ${id} servi depuis la base de données`);
    const role = await this.prisma.role.findFirst({ 
      where: { 
        id,
        companyId,
      },
    });
    
    if (!role) {
      throw new NotFoundException(`Rôle avec ID ${id} non trouvé`);
    }
    
    await this.cacheService.setRoleById(id, role);
    return role;
  }
}
