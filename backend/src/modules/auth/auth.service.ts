import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const tokens = await this.generateTokens(user.id, user.roleId, user.companyId);
    
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    // Mettre à jour la dernière connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: 'unknown', // À remplacer par l'IP réelle
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        companyId: user.companyId,
      },
      ...tokens,
    };
  }

  async loginWith2FA(email: string, password: string, token: string) {
    const user = await this.twoFactorService.validateTwoFactorLogin(email, password, token);
    
    const tokens = await this.generateTokens(user.id, user.roleId, user.companyId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        companyId: user.companyId,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      ...tokens,
    };
  }

  async register(dto: RegisterDto) {
    // Récupérer l'entreprise par défaut (à modifier selon votre logique)
    const company = await this.prisma.company.findFirst();
    
    if (!company) {
      throw new BadRequestException('No company found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
        companyId: company.id,
        isActive: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.roleId, user.companyId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        companyId: user.companyId,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.roleId, user.companyId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If email exists, reset link will be sent' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );

    return { 
      message: 'Reset link sent to email',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      });

      return { message: 'Password reset successful' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async getProfile(userId: number) {
    return this.usersService.findOne(userId);
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier si le compte est verrouillé
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Incrémenter les tentatives
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: { increment: 1 },
          ...(user.loginAttempts >= 4 ? { lockedUntil: new Date(Date.now() + 15 * 60000) } : {}),
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Réinitialiser les tentatives
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    return user;
  }

  private async generateTokens(userId: number, roleId: number, companyId: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role: roleId, companyId },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, role: roleId, companyId },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
