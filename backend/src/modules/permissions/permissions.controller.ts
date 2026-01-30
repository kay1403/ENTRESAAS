import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private service: PermissionsService) {}

  @Get() @Roles('ADMIN') findAll() { return this.service.findAll(); }
  @Post() @Roles('ADMIN') create(@Body() dto: CreatePermissionDto) { return this.service.createPermission(dto); }
  @Patch(':id') @Roles('ADMIN') update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.service.updatePermission(+id, dto);
  }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.service.deletePermission(+id); }
}
