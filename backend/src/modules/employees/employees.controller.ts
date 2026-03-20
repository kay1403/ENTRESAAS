import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  create(@CurrentCompany() companyId: number, @Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(companyId, createEmployeeDto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: number) {
    return this.employeesService.findAll(companyId);
  }

  @Get('department/:departmentId')
  findByDepartment(
    @Param('departmentId') departmentId: string,
    @CurrentCompany() companyId: number,
  ) {
    return this.employeesService.findByDepartment(+departmentId, companyId);
  }

  @Get('manager/:managerId')
  findByManager(
    @Param('managerId') managerId: string,
    @CurrentCompany() companyId: number,
  ) {
    return this.employeesService.findByManager(+managerId, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.employeesService.findOne(+id, companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(+id, companyId, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.employeesService.remove(+id, companyId);
  }
}
