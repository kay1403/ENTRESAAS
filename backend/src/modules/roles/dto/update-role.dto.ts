import { IsString, IsArray, ArrayNotEmpty, IsOptional, IsInt } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds?: number[];
}
