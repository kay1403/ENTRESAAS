import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ExportOptionsDto, ExportFormat, ExportEntity } from './dto/export-options.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({
  path: 'export',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post()
  async exportData(@Body() options: ExportOptionsDto, @Res() res: Response) {
    return this.exportService.exportData(options, res);
  }

  @Get('users')
  async exportUsers(@Res() res: Response) {
    const options: ExportOptionsDto = {
      format: ExportFormat.EXCEL,
      entity: ExportEntity.USERS,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('users/pdf')
  async exportUsersPDF(@Res() res: Response) {
    const options: ExportOptionsDto = {
      format: ExportFormat.PDF,
      entity: ExportEntity.USERS,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('users/csv')
  async exportUsersCSV(@Res() res: Response) {
    const options: ExportOptionsDto = {
      format: ExportFormat.CSV,
      entity: ExportEntity.USERS,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('roles')
  async exportRoles(@Res() res: Response) {
    const options: ExportOptionsDto = {
      format: ExportFormat.EXCEL,
      entity: ExportEntity.ROLES,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('audit-logs')
  async exportAuditLogs(@Res() res: Response) {
    const options: ExportOptionsDto = {
      format: ExportFormat.EXCEL,
      entity: ExportEntity.AUDIT_LOGS,
    };
    return this.exportService.exportData(options, res);
  }
}
