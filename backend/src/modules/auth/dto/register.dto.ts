import { IsEmail, IsString, MinLength, IsNotEmpty, IsInt } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  roleId: number;
}
