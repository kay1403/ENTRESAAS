import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  async generateTwoFactorSecret(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const secret = speakeasy.generateSecret({
      name: `ENTRESAAS:${user.email}`,
      issuer: 'ENTRESAAS',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    let qrCode = '';
    if (secret.otpauth_url) {
      qrCode = await QRCode.toDataURL(secret.otpauth_url);
    }

    return {
      secret: secret.base32,
      qrCode,
      message: 'Scannez ce QR code avec Google Authenticator',
    };
  }

  async enableTwoFactor(userId: number, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Secret 2FA non trouvé');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Token 2FA invalide');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return {
      message: '2FA activé avec succès',
      backupCodes: this.generateBackupCodes(),
    };
  }

  async disableTwoFactor(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: '2FA désactivé avec succès' };
  }

  async verifyTwoFactorToken(userId: number, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1,
    });
  }

  async validateTwoFactorLogin(email: string, password: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.isTwoFactorEnabled) {
      const isValidToken = await this.verifyTwoFactorToken(user.id, token);
      if (!isValidToken) {
        throw new UnauthorizedException('Token 2FA invalide');
      }
    }

    return user;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  async get2FAStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isTwoFactorEnabled: true },
    });

    return {
      isEnabled: user?.isTwoFactorEnabled || false,
    };
  }
}
