import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<any>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Récupérer l'utilisateur avec son rôle et ses permissions
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        role: true,
        employeeInfo: {
          include: {
            manager: true,
            department: true,
          },
        },
      },
    });

    if (!dbUser || !dbUser.role) {
      throw new ForbiddenException('Rôle non trouvé');
    }

    // Vérifier les permissions
    const permissions = dbUser.role.permissions as any;

    // Vérification récursive
    const checkPermission = (required: any, actual: any): boolean => {
      if (typeof required === 'boolean') {
        return required === actual;
      }

      if (typeof required === 'object' && required !== null) {
        for (const key in required) {
          if (!(key in actual)) {
            return false;
          }
          if (!checkPermission(required[key], actual[key])) {
            return false;
          }
        }
        return true;
      }

      return false;
    };

    if (!checkPermission(requiredPermissions, permissions)) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    // Ajouter les informations au request pour les contrôleurs
    (context.switchToHttp().getRequest() as any).userInfo = dbUser.employeeInfo;

    return true;
  }
}
