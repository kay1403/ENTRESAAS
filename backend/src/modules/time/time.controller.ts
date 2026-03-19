import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TimeService } from './time.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('time')
@UseGuards(JwtAuthGuard)
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  @Post('check-in')
  async checkIn(@CurrentUser() user: any) {
    return this.timeService.checkIn(user.userId); // CORRIGÉ
  }

  @Post('check-out')
  async checkOut(@CurrentUser() user: any) {
    return this.timeService.checkOut(user.userId); // CORRIGÉ
  }

  @Get('today')
  async getToday(@CurrentUser() user: any) {
    return this.timeService.getTodayEntries(user.userId); // CORRIGÉ
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any) {
    return this.timeService.getHistory(user.userId); // CORRIGÉ
  }
}
