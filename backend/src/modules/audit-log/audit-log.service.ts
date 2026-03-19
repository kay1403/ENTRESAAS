import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  createLog(data: {
    action: string;
    userId: number;
    companyId: number;
    entityType: string;
    entityId?: number;
    oldData?: any;
    newData?: any;
    ip?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        companyId: data.companyId,
        entityType: data.entityType,
        entityId: data.entityId,
        oldData: data.oldData,
        newData: data.newData,
        ip: data.ip,
      },
    });
  }

  findAll(companyId: number) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
