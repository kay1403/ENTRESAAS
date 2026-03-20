'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveBalance {
  leaveType: { name: string; color: string };
  totalDays: number;
  usedDays: number;
  pendingDays: number;
}

interface LeaveRequest {
  id: number;
  leaveType: { name: string; color: string };
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: { email: string };
}

export default function LeavePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [balancesData, requestsData] = await Promise.all([
        api.getLeaveBalances(),
        api.getLeaveRequests(),
      ]);
      setBalances(balancesData);
      setRequests(requestsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLeaveRequest(formData);
      toast.success('Demande de congés créée');
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-error';
      default: return 'badge-warning';
    }
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des congés</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Soldes de congés */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mes soldes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : balances.length === 0 ? (
              <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun solde disponible</p>
              </div>
            ) : (
              balances.map((balance, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: balance.leaveType.color + '20', color: balance.leaveType.color }}>
                      {balance.leaveType.name}
                    </span>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                      <span className="font-medium text-gray-900 dark:text-white">{balance.totalDays} jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Utilisés</span>
                      <span className="font-medium text-gray-900 dark:text-white">{balance.usedDays} jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Restants</span>
                      <span className="font-medium text-blue-600">{balance.totalDays - balance.usedDays - balance.pendingDays} jours</span>
                    </div>
                    {balance.pendingDays > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <span className="text-sm">En attente</span>
                        <span className="font-medium">{balance.pendingDays} jours</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bouton nouvelle demande */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle demande
          </button>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mes demandes</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucune demande de congés</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Motif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: request.leaveType.color + '20', color: request.leaveType.color }}>
                          {request.leaveType.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {request.daysCount} jour(s)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${getStatusBadge(request.status)}`}>
                          {request.status === 'PENDING' ? 'En attente' : 
                           request.status === 'APPROVED' ? 'Approuvé' : 'Refusé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Nouvelle demande de congés
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de congés
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ANNUAL">Congés annuels</option>
                    <option value="SICK">Congés maladie</option>
                    <option value="UNPAID">Congés sans solde</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Motif
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Raison de votre demande..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
