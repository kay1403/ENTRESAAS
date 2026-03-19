'use client';

import { useAuthStore } from '@/store/authStore';

type Permission = 
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
  | 'export:data';

const rolePermissions: Record<number, Permission[]> = {
  1: [ // ADMIN
    'view:users', 'create:users', 'edit:users', 'delete:users',
    'view:roles', 'create:roles', 'edit:roles', 'delete:roles',
    'view:permissions', 'edit:permissions',
    'view:audit-logs', 'export:data',
  ],
  2: [ // MANAGER
    'view:users', 'edit:users',
    'view:roles',
    'export:data',
  ],
  3: [ // USER
    // No permissions by default
  ],
};

export function usePermissions() {
  const { user } = useAuthStore();
  const roleId = user?.roleId || 3;

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[roleId]?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    roleId,
  };
}
