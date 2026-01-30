import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaClient } from '@prisma/client';

// Exporte la configuration Prisma
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    adapter: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});

// Exporte le client Prisma pour l’utiliser dans NestJS
export const prisma = new PrismaClient();
