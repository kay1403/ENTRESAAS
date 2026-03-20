'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import ThemeToggle from './ThemeToggle';
import { 
  Home, Users, Shield, Key, FileText, Calendar, Clock, 
  Receipt, CheckSquare, MessageSquare, FolderTree, User, 
  Settings, LogOut, Briefcase, File, Bell, Menu, X
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { api } from '@/lib/api';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { hasPermission, roleId } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Charger le nom personnalisé depuis localStorage
    const savedName = localStorage.getItem('userDisplayName');
    if (savedName) {
      setDisplayName(savedName);
    } else if (user?.email) {
      // Par défaut, utiliser la partie avant @ de l'email
      const defaultName = user.email.split('@')[0];
      setDisplayName(defaultName);
      localStorage.setItem('userDisplayName', defaultName);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const isAdmin = roleId === 1;
  const isManager = roleId === 2;

  // Menu items avec permissions
  const menuItems = [
    {
      section: 'Général',
      items: [
        { href: '/dashboard', icon: Home, label: 'Tableau de bord', permission: true },
        { href: '/profile', icon: User, label: 'Mon profil', permission: true },
        { href: '/settings', icon: Settings, label: 'Paramètres', permission: true },
      ],
    },
    {
      section: 'Gestion RH',
      items: [
        { href: '/leave', icon: Calendar, label: 'Congés', permission: true },
        { href: '/time', icon: Clock, label: 'Pointage', permission: true },
        { href: '/expense', icon: Receipt, label: 'Notes de frais', permission: true },
        { href: '/tasks', icon: CheckSquare, label: 'Tâches', permission: true },
        { href: '/messages', icon: MessageSquare, label: 'Messages', permission: true },
        { href: '/documents', icon: File, label: 'Documents', permission: true },
      ],
    },
    {
      section: 'Administration',
      items: [
        { href: '/users', icon: Users, label: 'Utilisateurs', permission: isAdmin || isManager },
        { href: '/roles', icon: Shield, label: 'Rôles', permission: isAdmin },
        { href: '/permissions', icon: Key, label: 'Permissions', permission: isAdmin },
        { href: '/audit-logs', icon: FileText, label: 'Audit logs', permission: isAdmin },
        { href: '/departments', icon: FolderTree, label: 'Départements', permission: isAdmin || isManager },
        { href: '/employees', icon: Briefcase, label: 'Employés', permission: isAdmin || isManager },
      ],
    },
  ];

  // Filtrer les items selon les permissions
  const filteredMenu = menuItems
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.permission),
    }))
    .filter(section => section.items.length > 0);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation supérieure */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Bouton hamburger - visible sur tous les écrans */}
              {showSidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menu"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                ENTRESAAS
              </Link>
              <span className="ml-4 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {isAdmin ? 'Admin' : isManager ? 'Manager' : 'User'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - avec animation de slide */}
        {showSidebar && (
          <aside 
            className={`fixed lg:relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 z-40 ${
              sidebarOpen ? 'w-64 left-0' : 'w-0 -left-64 lg:left-0 overflow-hidden'
            }`}
          >
            <nav className="p-4 space-y-6">
              {filteredMenu.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* Overlay pour mobile quand sidebar est ouverte */}
        {showSidebar && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal - s'étend quand sidebar est fermée */}
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'p-4 sm:p-8' : 'p-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
