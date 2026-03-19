// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    try {
      // Vérifier si l'utilisateur a le rôle requis
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          role: true,
        },
      });

      if (!dbUser || !dbUser.role) {
        throw new ForbiddenException('Role not found');
      }

      // Vérifier si le nom du rôle correspond
      const hasRole = requiredRoles.includes(dbUser.role.name);
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in RolesGuard: ${error.message}`);
      
      // En cas d'erreur de DB, on refuse l'accès par sécurité
      if (error.code === 'P1001' || error.message.includes('database')) {
        throw new ForbiddenException('Database connection error');
      }
      
      throw error;
    }
  }
}
