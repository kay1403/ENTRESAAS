import { IsEnum, IsOptional, IsArray, IsString, IsDateString } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
}

export enum ExportEntity {
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  AUDIT_LOGS = 'audit-logs',
}

export class ExportOptionsDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportEntity)
  entity: ExportEntity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  filters?: any;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
