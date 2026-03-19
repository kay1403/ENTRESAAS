import { Controller, Post, Body, Res, UseGuards, Get, Param } from '@nestjs/common';
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

  @Get('users/:format')
  async exportUsers(@Param('format') format: string, @Res() res: Response) {
    let exportFormat: ExportFormat;
    
    switch(format) {
      case 'excel':
        exportFormat = ExportFormat.EXCEL;
        break;
      case 'pdf':
        exportFormat = ExportFormat.PDF;
        break;
      case 'csv':
        exportFormat = ExportFormat.CSV;
        break;
      default:
        exportFormat = ExportFormat.EXCEL;
    }
    
    const options: ExportOptionsDto = {
      format: exportFormat,
      entity: ExportEntity.USERS,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('roles/:format')
  async exportRoles(@Param('format') format: string, @Res() res: Response) {
    let exportFormat: ExportFormat;
    
    switch(format) {
      case 'excel':
        exportFormat = ExportFormat.EXCEL;
        break;
      case 'pdf':
        exportFormat = ExportFormat.PDF;
        break;
      case 'csv':
        exportFormat = ExportFormat.CSV;
        break;
      default:
        exportFormat = ExportFormat.EXCEL;
    }
    
    const options: ExportOptionsDto = {
      format: exportFormat,
      entity: ExportEntity.ROLES,
    };
    return this.exportService.exportData(options, res);
  }

  @Get('audit-logs/:format')
  async exportAuditLogs(@Param('format') format: string, @Res() res: Response) {
    let exportFormat: ExportFormat;
    
    switch(format) {
      case 'excel':
        exportFormat = ExportFormat.EXCEL;
        break;
      case 'pdf':
        exportFormat = ExportFormat.PDF;
        break;
      case 'csv':
        exportFormat = ExportFormat.CSV;
        break;
      default:
        exportFormat = ExportFormat.EXCEL;
    }
    
    const options: ExportOptionsDto = {
      format: exportFormat,
      entity: ExportEntity.AUDIT_LOGS,
    };
    return this.exportService.exportData(options, res);
  }
}
