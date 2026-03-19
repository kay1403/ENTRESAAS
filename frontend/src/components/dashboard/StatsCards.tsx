'use client';

import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{ roleName: string; count: number }>;
  } | null;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission('view:users')) return null;

  const cards = [
    {
      title: 'Total Users',
      value: stats?.total || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Active Users',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'green',
      change: '+5%',
    },
    {
      title: 'Inactive Users',
      value: stats?.inactive || 0,
      icon: UserX,
      color: 'yellow',
      change: '-2%',
    },
    {
      title: 'By Role',
      value: stats?.byRole?.length || 0,
      icon: TrendingUp,
      color: 'purple',
      change: '3 roles',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <Icon className="h-6 w-6" />
              </div>
              {card.change && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  {card.change}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            
            {index === 3 && stats?.byRole && (
              <div className="mt-3 space-y-1">
                {stats.byRole.map((role, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{role.roleName}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{role.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
