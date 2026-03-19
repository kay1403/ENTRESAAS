import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CommonModule } from './common/common.module'; 
import { ExportModule } from './modules/export/export.module';
import { LeaveModule } from './modules/leave/leave.module';
import { TimeModule } from './modules/time/time.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { TaskModule } from './modules/task/task.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AuditInterceptor } from './modules/audit-log/interceptors/audit.interceptor';
import { validate } from './config/env.validation';
import { RedisConfig } from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: RedisConfig,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditLogModule,
    CommonModule,
    ExportModule,
    LeaveModule,
    TimeModule,
    ExpenseModule,
    TaskModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
