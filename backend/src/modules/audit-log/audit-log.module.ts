import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditInterceptor],
  exports: [AuditLogService],
})
export class AuditLogModule {}
