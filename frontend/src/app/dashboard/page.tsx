'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Users, Shield, FileText, Download, User, Settings, LogOut, Activity, Key, BarChart } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ENTRESAAS</h1>
              <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${roleBadge.color}`}>
                {roleBadge.text}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <span className="text-gray-700 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : stats?.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : stats?.active || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <BarChart className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">By Role</p>
                  <p className="text-sm text-gray-900">
                    {!isLoading && stats?.byRole?.map(r => 
                      `${r.roleName}: ${r.count}`
                    ).join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Export - Admin only */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Export</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExport('excel')}
                        className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email}!
            </h2>
            <p className="text-gray-600">
              You are logged in as a standard user. Visit your profile to manage your account settings.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Everyone */}
          <Link
            href="/profile"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
          >
            <User className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
            <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
              My Profile
            </span>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
          >
            <Key className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
            <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
              2FA Settings
            </span>
          </Link>

          {/* Admin & Manager */}
          {(isAdmin || isManager) && (
            <>
              <Link
                href="/users"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
              >
                <Users className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
                  Manage Users
                </span>
              </Link>

              <Link
                href="/roles"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
              >
                <Shield className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
              >
                <Key className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
                  Permissions
                </span>
              </Link>

              <Link
                href="/audit-logs"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
              >
                <FileText className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-primary-600">
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
