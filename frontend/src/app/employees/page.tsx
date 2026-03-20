'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Users, UserPlus, Mail, Phone, MapPin, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Employee {
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

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'ALL' || emp.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'badge-success';
      case 'INACTIVE': return 'badge-error';
      case 'ON_LEAVE': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'ON_LEAVE': return 'En congés';
      case 'TERMINATED': return 'Sorti';
      default: return status;
    }
  };

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'ACTIVE').length,
    onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
    terminated: employees.filter(e => e.status === 'TERMINATED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ← Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employés</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">En congés</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.onLeave}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sortis</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.terminated}</p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="ON_LEAVE">En congés</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="TERMINATED">Sortis</option>
          </select>
          <Link
            href="/employees/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Nouvel employé
          </Link>
        </div>

        {/* Liste des employés */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun employé trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee) => (
                <Link
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {employee.email}
                              </span>
                              {employee.position && (
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {employee.position}
                                </span>
                              )}
                              {employee.department && (
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {employee.department.name}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Embauché le {new Date(employee.hireDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`${getStatusBadge(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
