import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@CurrentUser() user: any) {
    return this.notificationService.getMyNotifications(user.userId); // CORRIGÉ
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: any) {
    return this.notificationService.getUnreadCount(user.userId); // CORRIGÉ
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationService.markAsRead(+id, user.userId); // CORRIGÉ
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.userId); // CORRIGÉ
  }
}
