'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuditLog } from '@/lib/api';
import { FileText, ArrowLeft, Download, Filter, X, RefreshCw } from 'lucide-react';
import Loader from '@/components/Loader';
import { showToast } from '@/lib/toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function AuditLogsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (!hasPermission('view:audit-logs')) {
      router.push('/dashboard');
      return;
    }
    loadLogs();
  }, []);

  const loadLogs = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (error) {
      showToast.error('Error loading audit logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = 
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(filter.toLowerCase()) ||
      log.ip.includes(filter);
    
    if (!dateRange.start && !dateRange.end) return matchesFilter;
    
    const logDate = new Date(log.createdAt);
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    
    if (start && end) {
      return matchesFilter && logDate >= start && logDate <= end;
    } else if (start) {
      return matchesFilter && logDate >= start;
    } else if (end) {
      return matchesFilter && logDate <= end;
    }
    return matchesFilter;
  });

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  const handleExport = async () => {
    try {
      await api.exportAuditLogs('excel');
      showToast.success('Audit logs exported successfully');
    } catch (error) {
      showToast.error('Export failed');
    }
  };

  const clearFilters = () => {
    setFilter('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadLogs(true)}
                disabled={isRefreshing}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Filter by action, user, or IP..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {(filter || dateRange.start || dateRange.end) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="py-12">
              <Loader text="Loading audit logs..." />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No logs found</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {filter || dateRange.start || dateRange.end 
                  ? 'Try adjusting your filters' 
                  : 'Audit logs will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {log.user?.email || `User #${log.userId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800">
                        View Details →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 animate-slideIn">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Action</label>
                <p className="mt-1 text-gray-900 dark:text-white font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">User</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedLog.user?.email || `User #${selectedLog.userId}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">IP Address</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Timestamp</label>
                <p className="mt-1 text-gray-900 dark:text-white">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Payload</label>
                <pre className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md overflow-auto max-h-60 text-sm text-gray-900 dark:text-gray-300">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
