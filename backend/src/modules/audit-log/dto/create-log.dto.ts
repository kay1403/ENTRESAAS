import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateLogDto {
  @IsString()
  action: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  payload?: any;
}
