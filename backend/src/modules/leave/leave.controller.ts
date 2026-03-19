import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('balances')
  async getBalances(@CurrentUser() user: any) {
    return this.leaveService.getBalances(user.userId); // CORRIGÉ: user.userId au lieu de user.id
  }

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    return this.leaveService.getBalance(user.userId); // CORRIGÉ
  }

  @Get('requests')
  async getRequests(@CurrentUser() user: any) {
    return this.leaveService.getRequests(user.userId); // CORRIGÉ
  }

  @Post('requests')
  async createRequest(@CurrentUser() user: any, @Body() data: any) {
    return this.leaveService.createRequest(user.userId, data); // CORRIGÉ
  }

  @Post('requests/:id/approve')
  @Roles('MANAGER', 'ADMIN')
  async approveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leaveService.approveRequest(+id, user.userId); // CORRIGÉ
  }
}
