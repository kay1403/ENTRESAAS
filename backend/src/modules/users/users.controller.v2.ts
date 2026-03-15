import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({
  path: 'users',
  version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersControllerV2 {
  constructor(private service: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll(@Query() pagination: PaginationDto) {
    const users = await this.service.findAll();
    
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = users.slice(start, end);
    
    // Récupérer les rôles pour avoir les noms
    const roles = await this.prisma.role.findMany();
    
    return {
      data: paginatedUsers.map(user => {
        const role = roles.find(r => r.id === user.roleId);
        return new UserResponseDto({
          id: user.id,
          email: user.email,
          roleId: user.roleId,
          roleName: role?.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
        });
      }),
      meta: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    };
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    const users = await this.service.findAll();
    const statsByRole = await this.service.getUserStatsByRole();
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: statsByRole,
    };
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findOne(+id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    
    // Récupérer le rôle pour avoir le nom
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId }
    });
    
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: role?.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.createUser(dto);
    
    // Récupérer le rôle pour avoir le nom
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId }
    });
    
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: role?.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.updateUser(+id, dto);
    
    // Récupérer le rôle pour avoir le nom
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId }
    });
    
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: role?.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.deleteUser(+id);
  }

  // Ajouter une référence à PrismaService
  private get prisma() {
    return (this.service as any).prisma;
  }
}
