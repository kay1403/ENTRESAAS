import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    const startTime = Date.now();
    const { method, originalUrl, body, ip, headers } = req;
    const userAgent = headers['user-agent'];
    
    // Extraire l'utilisateur du token (sera ajouté par le guard)
    const user = (req as any).user;

    // Intercepter la réponse pour capturer le résultat
    res.send = function(body): Response {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Logger l'action (en asynchrone pour ne pas bloquer)
      setImmediate(async () => {
        try {
          // Ne pas auditer les requêtes OPTIONS et les favicons
          if (method === 'OPTIONS' || originalUrl.includes('favicon')) {
            return;
          }

          // Déterminer l'action
          let action = method;
          if (statusCode >= 200 && statusCode < 300) {
            action += '_SUCCESS';
          } else if (statusCode >= 400 && statusCode < 500) {
            action += '_CLIENT_ERROR';
          } else if (statusCode >= 500) {
            action += '_SERVER_ERROR';
          }

          // Extraire l'entité et l'ID de l'URL
          const urlParts = originalUrl.split('/');
          const entityType = urlParts[2] || 'unknown';
          let entityId: number | null = null;
          
          const idMatch = originalUrl.match(/\/(\d+)(\/|$)/);
          if (idMatch) {
            entityId = parseInt(idMatch[1], 10);
          }

          // Extraire la companyId du user ou du body
          let companyId = user?.companyId;
          if (!companyId && req.body?.companyId) {
            companyId = req.body.companyId;
          }

          if (companyId && user) {
            await this.prisma.auditLog.create({
              data: {
                companyId,
                userId: user.userId,
                action,
                entityType,
                entityId: entityId || undefined,
                oldData: method === 'PATCH' || method === 'PUT' ? {} : undefined,
                newData: method !== 'GET' ? body : undefined,
                ip: ip || undefined,
                userAgent: userAgent || undefined,
                metadata: {
                  responseTime,
                  statusCode,
                },
              },
            });
          }
        } catch (error) {
          console.error('Audit log error:', error);
        }
      });

      return originalSend.call(this, body);
    };

    next();
  }
}
