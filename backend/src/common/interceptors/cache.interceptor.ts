import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const key = this.getCacheKey(context);
    const ttl = this.getCacheTTL(context);
    
    if (!key) {
      return next.handle();
    }

    const cached = await this.cacheManager.get(key);
    
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(response => {
        if (response) {
          this.cacheManager.set(key, response, ttl);
        }
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string | null {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    
    if (user?.userId) {
      return `cache:${user.userId}:${method}:${url}`;
    }
    
    return `cache:anonymous:${method}:${url}`;
  }

  private getCacheTTL(context: ExecutionContext): number {
    return this.reflector.get<number>('cache_ttl', context.getHandler()) || 60;
  }
}
