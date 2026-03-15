import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class RedisConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const redisHost = this.configService.get('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get('REDIS_PORT', '6379');
    
    return {
      store: redisStore,
      host: redisHost,
      port: parseInt(redisPort, 10),
      ttl: 60, // 60 secondes par défaut
      max: 100, // maximum 100 items en cache
      isGlobal: true,
    };
  }
}
