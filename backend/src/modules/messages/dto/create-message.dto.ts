import { IsString, IsOptional, IsInt, IsArray, IsBoolean } from 'class-validator';
import { NotificationPriority } from '@prisma/client';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  recipientIds?: number[];

  @IsOptional()
  @IsBoolean()
  isTeam?: boolean;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  priority?: NotificationPriority;
}

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
