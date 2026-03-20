'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate?: string;
  createdBy: { email: string };
  assignments?: { user: { email: string } }[];
}

export default function TasksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMyTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask(formData);
      toast.success('Tâche créée');
      setShowModal(false);
      loadTasks();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeTask(id);
      toast.success('Tâche terminée');
      loadTasks();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'DONE': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'REVIEW': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <CheckSquare className="h-5 w-5 text-gray-400" />;
    }
  };

  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter(t => t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE'),
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tâches</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Bouton nouvelle tâche */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle tâche
          </button>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* TODO */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              À faire ({tasksByStatus.TODO.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.TODO.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              En cours ({tasksByStatus.IN_PROGRESS.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.IN_PROGRESS.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          </div>

          {/* REVIEW */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Revue ({tasksByStatus.REVIEW.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.REVIEW.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          </div>

          {/* DONE */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Terminé ({tasksByStatus.DONE.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.DONE.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Nouvelle tâche
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant TaskCard
function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) {
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
        {task.status !== 'DONE' && (
          <button
            onClick={() => onComplete(task.id)}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {task.dueDate && (
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {task.assignments && task.assignments.length > 0 && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <User className="h-3 w-3 mr-1" />
          {task.assignments.map(a => a.user.email).join(', ')}
        </div>
      )}
    </div>
  );
}
