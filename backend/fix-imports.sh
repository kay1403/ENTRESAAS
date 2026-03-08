#!/bin/bash

echo "🔧 Correction des imports manquants..."

# Créer les dossiers si nécessaires
mkdir -p src/modules/users/dto
mkdir -p src/modules/roles/dto
mkdir -p src/modules/permissions/dto
mkdir -p src/modules/audit-log/dto

# Créer les fichiers index.ts
echo "📁 Création des fichiers index.ts..."

cat > src/modules/users/dto/index.ts << 'EOF'
export * from './create-user.dto';
export * from './update-user.dto';
EOF

cat > src/modules/roles/dto/index.ts << 'EOF'
export * from './create-role.dto';
export * from './update-role.dto';
EOF

cat > src/modules/permissions/dto/index.ts << 'EOF'
export * from './create-permission.dto';
export * from './update-permission.dto';
EOF

cat > src/modules/audit-log/dto/index.ts << 'EOF'
export * from './create-log.dto';
EOF

# Créer les modules manquants
echo "📦 Création des modules..."

cat > src/modules/users/users.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
EOF

cat > src/modules/roles/roles.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
EOF

cat > src/modules/permissions/permissions.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
EOF

cat > src/modules/audit-log/audit-log.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditInterceptor],
  exports: [AuditLogService],
})
export class AuditLogModule {}
EOF

echo "✅ Correction terminée !"
echo "🚀 Redémarrez le serveur avec: npm run start:dev"
