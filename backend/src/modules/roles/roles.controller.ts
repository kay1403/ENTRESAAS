import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private service: RolesService) {}

  @Get()
  @Roles('ADMIN')
  findAll(@CurrentCompany() companyId: number) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.service.findOne(+id, companyId);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateRoleDto, @CurrentCompany() companyId: number) {
    return this.service.createRole(dto, companyId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentCompany() companyId: number,
  ) {
    return this.service.updateRole(+id, dto, companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.service.deleteRole(+id, companyId);
  }
}
