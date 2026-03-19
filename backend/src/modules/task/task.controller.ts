import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.taskService.create(user.userId, data); // CORRIGÉ
  }

  @Get()
  async getMyTasks(@CurrentUser() user: any) {
    return this.taskService.getMyTasks(user.userId); // CORRIGÉ
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.taskService.complete(+id, user.userId); // CORRIGÉ
  }

  @Post(':id/assign')
  @Roles('MANAGER', 'ADMIN')
  async assign(@Param('id') id: string, @Body('userId') userId: number) {
    return this.taskService.assign(+id, userId);
  }
}
