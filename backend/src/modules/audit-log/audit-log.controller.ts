import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private service: AuditLogService) {}

  @Get() @Roles('ADMIN') findAll() { return this.service.findAll(); }
}
