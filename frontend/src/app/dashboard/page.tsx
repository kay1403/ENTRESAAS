'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/Layout';
import { 
  Users, Calendar, Clock, Receipt, CheckSquare,
  MessageSquare, File, Briefcase, FolderTree, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasPermission, isAdmin, isManager, isUser } = usePermissions();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (isAdmin || isManager) {
        const data = await api.getUserStats();
        setStats(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // Widgets accessibles selon les permissions
  const widgets = [
    { 
      title: 'Congés', 
      icon: Calendar, 
      href: '/leave', 
      color: 'blue',
      permission: hasPermission('view:leave'),
      stats: stats?.leavePending
    },
    { 
      title: 'Pointage', 
      icon: Clock, 
      href: '/time', 
      color: 'green',
      permission: hasPermission('view:time'),
    },
    { 
      title: 'Notes de frais', 
      icon: Receipt, 
      href: '/expense', 
      color: 'yellow',
      permission: hasPermission('view:expense'),
      stats: stats?.expensePending
    },
    { 
      title: 'Tâches', 
      icon: CheckSquare, 
      href: '/tasks', 
      color: 'purple',
      permission: hasPermission('view:tasks'),
      stats: stats?.tasksPending
    },
    { 
      title: 'Messages', 
      icon: MessageSquare, 
      href: '/messages', 
      color: 'pink',
      permission: hasPermission('view:messages'),
    },
    { 
      title: 'Documents', 
      icon: File, 
      href: '/documents', 
      color: 'indigo',
      permission: hasPermission('view:documents'),
    },
    { 
      title: 'Employés', 
      icon: Users, 
      href: '/employees', 
      color: 'cyan',
      permission: hasPermission('view:employees'),
    },
    { 
      title: 'Départements', 
      icon: FolderTree, 
      href: '/departments', 
      color: 'orange',
      permission: hasPermission('view:departments'),
    },
  ];

  // Filtrer les widgets selon les permissions
  const visibleWidgets = widgets.filter(w => w.permission);

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Message de bienvenue */}
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bonjour, {user?.email} !
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin && "Vous avez un accès administrateur complet."}
            {isManager && "Vous gérez une équipe."}
            {isUser && "Bienvenue sur votre espace personnel."}
          </p>
        </div>

        {/* Statistiques pour admin/manager */}
        {(isAdmin || isManager) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total utilisateurs</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {isLoading ? '...' : stats?.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {isLoading ? '...' : stats?.active || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rôles</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.byRole?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widgets dynamiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleWidgets.map((widget) => (
            <Link
              key={widget.href}
              href={widget.href}
              className="card hover:shadow-lg transition-all group"
            >
              <div className={`p-3 rounded-lg ${colorClasses[widget.color as keyof typeof colorClasses]} w-fit mb-4`}>
                <widget.icon className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {widget.title}
              </h3>
              {widget.stats !== undefined && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {widget.stats} en attente
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Message si aucun widget */}
        {visibleWidgets.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Vous n'avez pas encore accès à des modules.
              Contactez votre administrateur.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
