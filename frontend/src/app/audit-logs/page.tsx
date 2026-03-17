'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FileText, ArrowLeft, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  id: number;
  action: string;
  userId: number;
  user?: {
    email: string;
  };
  ip: string;
  payload: any;
  createdAt: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      // Note: You'll need to add getAuditLogs() to your api service
      // const data = await api.getAuditLogs();
      // setLogs(data);
      
      // For now, using mock data
      setLogs([
        {
          id: 1,
          action: 'USER_LOGIN',
          userId: 1,
          user: { email: 'admin@example.com' },
          ip: '192.168.1.100',
          payload: { success: true },
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          action: 'USER_CREATED',
          userId: 1,
          user: { email: 'admin@example.com' },
          ip: '192.168.1.100',
          payload: { userId: 2, email: 'test@example.com' },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } catch (error) {
      toast.error('Error loading audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.user?.email.toLowerCase().includes(filter.toLowerCase()) ||
    log.ip.includes(filter)
  );

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-green-100 text-green-800';
    if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {/* Export logs */}}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by action, user, or IP..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No logs found</h3>
              <p className="mt-2 text-gray-600">
                {filter ? 'Try adjusting your filter' : 'Audit logs will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user?.email || `User #${log.userId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button className="text-primary-600 hover:text-primary-800">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <p className="mt-1 text-gray-900">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-gray-900">{selectedLog.user?.email || `User #${selectedLog.userId}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <p className="mt-1 text-gray-900">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payload</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded-md overflow-auto max-h-60 text-sm">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
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
