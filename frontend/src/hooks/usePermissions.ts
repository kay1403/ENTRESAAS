'use client';

import { useAuthStore } from '@/store/authStore';
import { useMemo } from 'react';

export type Permission = 
  | 'view:users'
  | 'create:users'
  | 'edit:users'
  | 'delete:users'
  | 'view:roles'
  | 'create:roles'
  | 'edit:roles'
  | 'delete:roles'
  | 'view:permissions'
  | 'edit:permissions'
  | 'view:audit-logs'
  | 'export:data'
  | 'view:departments'
  | 'create:departments'
  | 'edit:departments'
  | 'delete:departments'
  | 'view:employees'
  | 'create:employees'
  | 'edit:employees'
  | 'delete:employees'
  | 'view:documents'
  | 'upload:documents'
  | 'delete:documents'
  | 'view:messages'
  | 'send:messages'
  | 'view:leave'
  | 'create:leave'
  | 'approve:leave'
  | 'view:time'
  | 'create:time'
  | 'view:expense'
  | 'create:expense'
  | 'approve:expense'
  | 'view:tasks'
  | 'create:tasks'
  | 'complete:tasks'
  | 'assign:tasks';

// Structure des permissions par rôle
const rolePermissions: Record<number, Permission[]> = {
  1: [ // ADMIN - Accès complet
    'view:users', 'create:users', 'edit:users', 'delete:users',
    'view:roles', 'create:roles', 'edit:roles', 'delete:roles',
    'view:permissions', 'edit:permissions',
    'view:audit-logs', 'export:data',
    'view:departments', 'create:departments', 'edit:departments', 'delete:departments',
    'view:employees', 'create:employees', 'edit:employees', 'delete:employees',
    'view:documents', 'upload:documents', 'delete:documents',
    'view:messages', 'send:messages',
    'view:leave', 'create:leave', 'approve:leave',
    'view:time', 'create:time',
    'view:expense', 'create:expense', 'approve:expense',
    'view:tasks', 'create:tasks', 'complete:tasks', 'assign:tasks',
  ],
  2: [ // MANAGER - Gestion d'équipe
    'view:users', 'edit:users',
    'view:roles',
    'view:departments', 'edit:departments',
    'view:employees', 'create:employees', 'edit:employees',
    'view:documents', 'upload:documents',
    'view:messages', 'send:messages',
    'view:leave', 'create:leave', 'approve:leave',
    'view:time', 'create:time',
    'view:expense', 'create:expense', 'approve:expense',
    'view:tasks', 'create:tasks', 'complete:tasks', 'assign:tasks',
    'export:data',
  ],
  3: [ // USER - Accès limité
    'view:documents', 'upload:documents',
    'view:messages', 'send:messages',
    'view:leave', 'create:leave',
    'view:time', 'create:time',
    'view:expense', 'create:expense',
    'view:tasks', 'create:tasks', 'complete:tasks',
  ],
};

export function usePermissions() {
  const { user } = useAuthStore();
  const roleId = user?.roleId || 3;

  const permissions = useMemo(() => {
    return rolePermissions[roleId] || [];
  }, [roleId]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const canAccessRoute = (path: string): boolean => {
    // Routes publiques
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (publicRoutes.includes(path)) return true;

    // Routes protégées par rôle
    const routePermissions: Record<string, Permission[]> = {
      '/users': ['view:users'],
      '/users/new': ['create:users'],
      '/users/edit': ['edit:users'],
      '/roles': ['view:roles'],
      '/permissions': ['view:permissions'],
      '/audit-logs': ['view:audit-logs'],
      '/departments': ['view:departments'],
      '/employees': ['view:employees'],
      '/documents': ['view:documents'],
      '/messages': ['view:messages'],
      '/leave': ['view:leave'],
      '/time': ['view:time'],
      '/expense': ['view:expense'],
      '/tasks': ['view:tasks'],
      '/profile': [], // Tout le monde
      '/settings': [], // Tout le monde
      '/dashboard': [], // Tout le monde
    };

    const required = routePermissions[path];
    if (!required) return true;
    if (required.length === 0) return true;
    
    return required.every(p => hasPermission(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    roleId,
    isAdmin: roleId === 1,
    isManager: roleId === 2,
    isUser: roleId === 3,
  };
}
