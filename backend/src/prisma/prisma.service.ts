import { Injectable, OnModuleInit } from '@nestjs/common';
import { prisma } from '../../prisma.config';

@Injectable()
export class PrismaService implements OnModuleInit {
  async onModuleInit() {
    await prisma.$connect();
  }

  get client() {
    return prisma;
  }
}
