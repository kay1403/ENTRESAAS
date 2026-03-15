import { IsString, Length, IsEmail } from 'class-validator';

export class Verify2FADto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @Length(6, 6)
  token: string;
}
