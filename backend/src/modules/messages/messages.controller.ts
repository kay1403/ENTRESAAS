import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @CurrentCompany() companyId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.create(user.userId, companyId, createMessageDto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: number, @CurrentUser() user: any) {
    return this.messagesService.findAll(companyId, user.userId);
  }

  @Get('unread/count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.messagesService.getUnreadCount(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: number) {
    return this.messagesService.findOne(+id, companyId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.markAsRead(+id, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.deleteForUser(+id, user.userId);
  }
}
