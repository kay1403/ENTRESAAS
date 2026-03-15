import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Méthodes spécifiques pour notre application
  async getUsers(): Promise<any> {
    return this.get('users:all');
  }

  async setUsers(users: any): Promise<void> {
    await this.set('users:all', users, 60); // Cache 60 secondes
  }

  async clearUsersCache(): Promise<void> {
    await this.del('users:all');
    await this.del('users:*'); // Supprimer tous les caches liés aux users
  }

  async getUserById(id: number): Promise<any> {
    return this.get(`users:${id}`);
  }

  async setUserById(id: number, user: any): Promise<void> {
    await this.set(`users:${id}`, user, 60);
  }

  async getRoles(): Promise<any> {
    return this.get('roles:all');
  }

  async setRoles(roles: any): Promise<void> {
    await this.set('roles:all', roles, 120); // Cache 2 minutes
  }

  async clearRolesCache(): Promise<void> {
    await this.del('roles:all');
    await this.del('roles:*');
  }
}
