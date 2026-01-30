import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  createLog(dto: CreateLogDto) {
    return this.prisma.auditLog.create({ data: dto });
  }

  findAll() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
