'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Clock, Play, Square, History, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimeEntry {
  id: number;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  workDate: string;
}

interface DailySummary {
  date: string;
  entries: TimeEntry[];
  totalMinutes?: number;
  totalHours?: string;
}

export default function TimePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [history, setHistory] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [activeCheck, setActiveCheck] = useState<{ hasCheckIn: boolean; hasCheckOut: boolean }>({ hasCheckIn: false, hasCheckOut: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [today, historyData] = await Promise.all([
        api.getTodayTimeEntries(),
        api.getTimeHistory(),
      ]);
      
      setTodayEntries(today.entries || []);
      setHistory(historyData);
      
      // Vérifier l'état du pointage aujourd'hui
      const hasCheckIn = today.entries?.some((e: TimeEntry) => e.type === 'CHECK_IN') || false;
      const hasCheckOut = today.entries?.some((e: TimeEntry) => e.type === 'CHECK_OUT') || false;
      setActiveCheck({ hasCheckIn, hasCheckOut });
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsChecking(true);
      await api.checkIn();
      toast.success('Check-in effectué');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur check-in');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsChecking(true);
      await api.checkOut();
      toast.success('Check-out effectué');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur check-out');
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pointage</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Horloge et actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
          <Clock className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {formatDate(new Date().toISOString())}
          </p>
          
          <div className="flex justify-center space-x-4">
            {!activeCheck.hasCheckIn ? (
              <button
                onClick={handleCheckIn}
                disabled={isChecking}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="h-5 w-5 mr-2" />
                Check-in
              </button>
            ) : !activeCheck.hasCheckOut ? (
              <button
                onClick={handleCheckOut}
                disabled={isChecking}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Square className="h-5 w-5 mr-2" />
                Check-out
              </button>
            ) : (
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Journée terminée
              </div>
            )}
          </div>
        </div>

        {/* Pointages du jour */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pointages du jour</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : todayEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun pointage aujourd'hui</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {entry.type === 'CHECK_IN' ? (
                      <Play className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <Square className="h-5 w-5 text-red-600 mr-3" />
                    )}
                    <span className="text-gray-900 dark:text-white font-medium">
                      {entry.type === 'CHECK_IN' ? 'Arrivée' : 'Départ'}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Historique</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun historique</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((day, index) => (
                <div key={index} className="px-6 py-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {formatDate(day.date)}
                  </h3>
                  <div className="space-y-2">
                    {day.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {entry.type === 'CHECK_IN' ? 'Arrivée' : 'Départ'}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                    {day.totalHours && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total</span>
                        <span className="font-medium text-blue-600">{day.totalHours} heures</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
