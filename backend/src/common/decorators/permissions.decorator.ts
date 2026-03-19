import { SetMetadata } from '@nestjs/common';

export const Permissions = (permissions: Record<string, any>) => 
  SetMetadata('permissions', permissions);
