'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Users, Shield, FileText, Download, User, Settings, LogOut, Activity, Key, BarChart } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byRole: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roleId = user?.roleId;
  const isAdmin = roleId === 1;
  const isManager = roleId === 2;  // MANAGER
  const isUser = roleId === 3;      // USER

  useEffect(() => {
    if (isAdmin || isManager) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, isManager]);

  const loadStats = async () => {
    try {
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      toast.error('Error loading statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    logout();
    router.push('/login');
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await api.exportUsers(format);
      toast.success(`Export ${format} downloaded`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Définir le rôle pour l'affichage
  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Administrator', color: 'bg-purple-100 text-purple-800' };
    if (isManager) return { text: 'Manager', color: 'bg-blue-100 text-blue-800' };
    return { text: 'User', color: 'bg-green-100 text-green-800' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ENTRESAAS</h1>
              <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${roleBadge.color}`}>
                {roleBadge.text}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              
              {/* Theme Toggle Button */}
              <ThemeToggle />
              
              <span className="text-gray-700 dark:text-gray-300 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards - Admin and Manager */}
        {(isAdmin || isManager) && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {isLoading ? '...' : stats?.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {isLoading ? '...' : stats?.active || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <BarChart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">By Role</p>
                  <p className="text-sm text-gray-900 dark:text-gray-300">
                    {!isLoading && stats?.byRole?.map((r, index) => (
                      <span key={r.roleId}>
                        {index > 0 && ' · '}
                        {r.roleName}: {r.count}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Export - Admin only */}
            {isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Export</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExport('excel')}
                        className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Welcome Message for Users */}
        {isUser && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.email}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You are logged in as a standard user. Visit your profile to manage your account settings.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Everyone */}
          <Link
            href="/profile"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
          >
            <User className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
              My Profile
            </span>
          </Link>

          <Link
            href="/settings"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
          >
            <Key className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
              2FA Settings
            </span>
          </Link>

          {/* Admin & Manager */}
          {(isAdmin || isManager) && (
            <>
              <Link
                href="/users"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
              >
                <Users className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  Manage Users
                </span>
              </Link>

              <Link
                href="/roles"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
              >
                <Shield className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  View Roles
                </span>
              </Link>
            </>
          )}

          {/* Admin Only */}
          {isAdmin && (
            <>
              <Link
                href="/permissions"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
              >
                <Key className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  Permissions
                </span>
              </Link>

              <Link
                href="/audit-logs"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all group hover:border-primary-300 dark:hover:border-primary-700"
              >
                <FileText className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  Audit Logs
                </span>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
