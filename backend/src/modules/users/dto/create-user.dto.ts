import { IsEmail, IsString, MinLength, IsInt, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  roleId: number;

  @IsBoolean()
  isActive: boolean;
}
