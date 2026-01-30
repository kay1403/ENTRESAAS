import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private service: RolesService) {}

  @Get() @Roles('ADMIN') findAll() { return this.service.findAll(); }
  @Post() @Roles('ADMIN') create(@Body() dto: CreateRoleDto) { return this.service.createRole(dto); }
  @Patch(':id') @Roles('ADMIN') update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateRole(+id, dto);
  }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.service.deleteRole(+id); }
}
