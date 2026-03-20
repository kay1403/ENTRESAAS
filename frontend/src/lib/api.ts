// API Service for frontend
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
  employeeInfo?: {
    firstName: string;
    lastName: string;
  };
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

export interface AuditLog {
  id: number;
  action: string;
  userId: number;
  user?: {
    email: string;
  };
  ip?: string;
  payload?: any;
  createdAt: string;
}

export interface LeaveBalance {
  leaveType: { name: string; color: string };
  totalDays: number;
  usedDays: number;
  pendingDays: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: { name: string; color: string };
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: { email: string };
}

export interface TimeEntry {
  id: number;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  workDate: string;
}

export interface Expense {
  id: number;
  category: { name: string };
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  receiptUrl?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate?: string;
  createdBy: { email: string };
  assignments?: { user: { email: string } }[];
}

export interface Employee {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: { name: string };
  manager?: { email: string };
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: { email: string };
  employees?: { id: number }[];
  createdAt: string;
}

export interface Document {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user?: { email: string };
}

export interface Message {
  id: number;
  sender: { email: string };
  subject?: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
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
      const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(error.message || 'Erreur API');
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

  async register(email: string, password: string, roleId: number) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roleId }),
    });
    return this.handleResponse<{ user: User }>(response);
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

  async getUserById(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateEmployeeInfo(data: { firstName?: string; lastName?: string }) {
    const response = await fetch(`${API_BASE_URL}/employees/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Employee>(response);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
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

  async getRoleById(id: number) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Role>(response);
  }

  async createRole(name: string, permissionIds: number[] = []) {
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

  // ==================== PERMISSIONS ENDPOINTS ====================

  async getPermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Permission[]>(response);
  }

  async getPermissionById(id: number) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Permission>(response);
  }

  async createPermission(name: string) {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });
    return this.handleResponse<Permission>(response);
  }

  async updatePermission(id: number, name: string) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });
    return this.handleResponse<Permission>(response);
  }

  async deletePermission(id: number) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== AUDIT LOGS ENDPOINTS ====================

  async getAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/audit-log`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AuditLog[]>(response);
  }

  // ==================== EXPORT ENDPOINTS ====================

  async exportUsers(format: 'excel' | 'pdf' | 'csv' = 'excel') {
    const response = await fetch(`${API_BASE_URL}/export/users/${format}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async exportAuditLogs(format: 'excel' | 'pdf' | 'csv' = 'excel') {
    const response = await fetch(`${API_BASE_URL}/export/audit-logs/${format}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ==================== LEAVE MODULE ====================
  
  async getLeaveBalances() {
    const response = await fetch(`${API_BASE_URL}/leave/balances`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<LeaveBalance[]>(response);
  }

  async getLeaveRequests() {
    const response = await fetch(`${API_BASE_URL}/leave/requests`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  async createLeaveRequest(data: any) {
    const response = await fetch(`${API_BASE_URL}/leave/requests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<LeaveRequest>(response);
  }

  async approveLeaveRequest(id: number) {
    const response = await fetch(`${API_BASE_URL}/leave/requests/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<LeaveRequest>(response);
  }

  // ==================== TIME MODULE ====================

  async checkIn() {
    const response = await fetch(`${API_BASE_URL}/time/check-in`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<TimeEntry>(response);
  }

  async checkOut() {
    const response = await fetch(`${API_BASE_URL}/time/check-out`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<TimeEntry>(response);
  }

  async getTodayTimeEntries() {
    const response = await fetch(`${API_BASE_URL}/time/today`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ entries: TimeEntry[]; summary: any }>(response);
  }

  async getTimeHistory() {
    const response = await fetch(`${API_BASE_URL}/time/history`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  // ==================== EXPENSE MODULE ====================

  async getExpenseCategories() {
    const response = await fetch(`${API_BASE_URL}/expense/categories`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  async createExpenseCategory(data: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/expense/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ id: number; name: string }>(response);
  }

  async createExpense(data: any) {
    const response = await fetch(`${API_BASE_URL}/expense`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Expense>(response);
  }

  async getMyExpenses() {
    const response = await fetch(`${API_BASE_URL}/expense`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Expense[]>(response);
  }

  // ==================== TASK MODULE ====================

  async createTask(data: any) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Task>(response);
  }

  async getMyTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Task[]>(response);
  }

  async completeTask(id: number) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Task>(response);
  }

  // ==================== EMPLOYEES MODULE ====================

  async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Employee[]>(response);
  }

  async getEmployeeById(id: number) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Employee>(response);
  }

  async createEmployee(data: any) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Employee>(response);
  }

  async updateEmployee(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Employee>(response);
  }

  // ==================== DEPARTMENTS MODULE ====================

  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Department[]>(response);
  }

  async getDepartmentById(id: number) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Department>(response);
  }

  async createDepartment(data: any) {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Department>(response);
  }

  async updateDepartment(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Department>(response);
  }

  async deleteDepartment(id: number) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== DOCUMENTS MODULE ====================

  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Document[]>(response);
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: formData,
    });
    return this.handleResponse<Document>(response);
  }

  async deleteDocument(id: number) {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== MESSAGES MODULE ====================

  async getMessages() {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Message[]>(response);
  }

  async sendMessage(data: any) {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Message>(response);
  }

  async markMessageAsRead(id: number) {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Message>(response);
  }
}

export const api = new ApiService();
