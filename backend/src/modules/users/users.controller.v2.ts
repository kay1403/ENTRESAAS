import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CacheTTL } from '../../common/decorators/cache-ttl.decorator';

@Controller({
  path: 'users',
  version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersControllerV2 {
  constructor(private service: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @CacheTTL(30) // Cache 30 secondes
  async findAll(@Query() pagination: PaginationDto) {
    const users = await this.service.findAll();
    
    // Appliquer pagination
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedUsers = users.slice(start, end);
    
    // Transformer en DTO de réponse
    const usersResponse = paginatedUsers.map(user => new UserResponseDto(user));
    
    return {
      data: usersResponse,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: users.length,
        totalPages: Math.ceil(users.length / pagination.limit),
      },
    };
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    const users = await this.service.findAll();
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: await this.service.getUserStatsByRole(),
    };
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findOne(+id);
    return new UserResponseDto(user);
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.createUser(dto);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.updateUser(+id, dto);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.deleteUser(+id);
  }
}
