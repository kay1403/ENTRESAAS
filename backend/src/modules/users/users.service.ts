import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
        isActive: dto.isActive,
      },
    });

    await this.cacheService.clearUsersCache();
    
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    await this.cacheService.clearUsersCache();
    await this.cacheService.del(`users:${id}`);
    
    return updatedUser;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.delete({ where: { id } });
    
    await this.cacheService.clearUsersCache();
    await this.cacheService.del(`users:${id}`);
  }

  async findAll() {
    const cached = await this.cacheService.getUsers();
    if (cached) {
      console.log('📦 Données servies depuis le cache');
      return cached;
    }

    console.log('🔄 Données servies depuis la base de données');
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, roleId: true, isActive: true },
    });

    await this.cacheService.setUsers(users);
    
    return users;
  }

  async findOne(id: number) {
    const cached = await this.cacheService.getUserById(id);
    if (cached) {
      console.log(`�� User ${id} servi depuis le cache`);
      return cached;
    }

    console.log(`🔄 User ${id} servi depuis la base de données`);
    const user = await this.prisma.user.findUnique({ 
      where: { id } 
    });
    
    if (!user) throw new NotFoundException('User not found');
    
    await this.cacheService.setUserById(id, user);
    
    return user;
  }

  async getUserStatsByRole() {
    const users = await this.prisma.user.groupBy({
      by: ['roleId'],
      _count: {
        id: true,
      },
    });

    const roles = await this.prisma.role.findMany();
    
    return users.map(stat => ({
      roleId: stat.roleId,
      roleName: roles.find(r => r.id === stat.roleId)?.name,
      count: stat._count.id,
    }));
  }
}
