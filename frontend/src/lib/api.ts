// API Service for frontend
// IMPORTANT: Inclure la version v1 dans l'URL de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{
    roleId: number;
    roleName: string;
    count: number;
  }>;
}

export interface User {
  id: number;
  email: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  createdAt: string;
}

class ApiService {
  private accessToken: string | null = null;
  private _refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this._refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this._refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  clearTokens() {
    this.accessToken = null;
    this._refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  getToken() {
    return this.accessToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'API Error');
    }
    return response.json();
  }

  // ==================== AUTH ENDPOINTS ====================

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(response);
    
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async loginWith2FA(email: string, password: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, token }),
    });
    const data = await this.handleResponse<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(response);
    
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async register(email: string, password: string, roleId: number) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roleId }),
    });
    return this.handleResponse<{ user: User }>(response);
  }

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this._refreshToken }),
    });
    const data = await this.handleResponse<{
      accessToken: string;
      refreshToken: string;
    }>(response);
    
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  // ==================== 2FA ENDPOINTS ====================

  async generate2FA() {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ secret: string; qrCode: string }>(response);
  }

  async enable2FA(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token }),
    });
    return this.handleResponse<{ message: string; backupCodes: string[] }>(response);
  }

  async disable2FA() {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async get2FAStatus() {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ isEnabled: boolean }>(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== USERS ENDPOINTS ====================

  async getUsersV1() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User[]>(response);
  }

  async getUsersV2(page = 1, limit = 10) {
    const url = new URL(`${API_BASE_URL.replace('/v1', '/v2')}/users`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<User>>(response);
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL.replace('/v1', '/v2')}/users/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserStats>(response);
  }

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(id: number, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== ROLES ENDPOINTS ====================

  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Role[]>(response);
  }

  async createRole(name: string, permissionIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, permissionIds }),
    });
    return this.handleResponse<Role>(response);
  }

  async updateRole(id: number, name: string, permissionIds?: number[]) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, permissionIds }),
    });
    return this.handleResponse<Role>(response);
  }

  async deleteRole(id: number) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getPermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Permission[]>(response);
  }

  // ==================== EXPORT ENDPOINTS ====================

  async exportUsers(format: 'excel' | 'pdf' | 'csv' = 'excel') {
    const response = await fetch(`${API_BASE_URL}/export/users/${format}`, {
      headers: this.getHeaders(),
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiService();
