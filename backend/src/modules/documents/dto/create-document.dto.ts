import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { DocumentSensitivity } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  typeId: number;

  @IsOptional()
  @IsEnum(DocumentSensitivity)
  sensitivity?: DocumentSensitivity;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  typeId?: number;

  @IsOptional()
  @IsEnum(DocumentSensitivity)
  sensitivity?: DocumentSensitivity;
}
