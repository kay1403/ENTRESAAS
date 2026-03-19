import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Activer le versioning de l'API
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Routes: /api/v1/auth/login
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`API v1: http://localhost:${port}/api/v1`);
  console.log(`API v2: http://localhost:${port}/api/v2`);
}

bootstrap();
