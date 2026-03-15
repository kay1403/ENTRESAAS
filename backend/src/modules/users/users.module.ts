import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersControllerV1 } from './users.controller.v1';
import { UsersControllerV2 } from './users.controller.v2';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersControllerV1, UsersControllerV2],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
