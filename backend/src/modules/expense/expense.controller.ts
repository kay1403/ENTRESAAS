import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('expense')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('categories')
  async getCategories() {
    return this.expenseService.getCategories();
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.expenseService.create(user.userId, data); // CORRIGÉ
  }

  @Get()
  async getMyExpenses(@CurrentUser() user: any) {
    return this.expenseService.getMyExpenses(user.userId); // CORRIGÉ
  }

  @Post(':id/approve')
  @Roles('MANAGER', 'ADMIN')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expenseService.approve(+id, user.userId); // CORRIGÉ
  }
}
