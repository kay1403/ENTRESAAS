import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  roleId: number;

  @Expose()
  roleName?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Exclude()
  password?: string;

  @Exclude()
  refreshToken?: string;

  @Exclude()
  twoFactorSecret?: string;

  @Exclude()
  isTwoFactorEnabled?: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
