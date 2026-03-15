import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl as any);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // Users cache methods
  async clearUsersCache(): Promise<void> {
    await this.del('users:all');
  }

  async getUsers(): Promise<any> {
    return this.get('users:all');
  }

  async setUsers(users: any): Promise<void> {
    await this.set('users:all', users, 60);
  }

  async getUserById(id: number): Promise<any> {
    return this.get(`users:${id}`);
  }

  async setUserById(id: number, user: any): Promise<void> {
    await this.set(`users:${id}`, user, 60);
  }

  // Roles cache methods
  async clearRolesCache(): Promise<void> {
    await this.del('roles:all');
  }

  async getRoles(): Promise<any> {
    return this.get('roles:all');
  }

  async setRoles(roles: any): Promise<void> {
    await this.set('roles:all', roles, 120);
  }

  async getRoleById(id: number): Promise<any> {
    return this.get(`roles:${id}`);
  }

  async setRoleById(id: number, role: any): Promise<void> {
    await this.set(`roles:${id}`, role, 120);
  }
}
