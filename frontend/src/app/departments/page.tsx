'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { FolderTree, Plus, Edit, Trash2, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: { email: string };
  employees?: { id: number }[];
  createdAt: string;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, formData);
        toast.success('Département modifié');
      } else {
        await api.createDepartment(formData);
        toast.success('Département créé');
      }
      setShowModal(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce département ?')) return;
    try {
      await api.deleteDepartment(id);
      toast.success('Département supprimé');
      loadDepartments();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', managerId: '' });
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Départements</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {departments.length} département(s)
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau département
          </button>
        </div>

        {/* Grille des départements */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun département</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Créez votre premier département</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FolderTree className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setFormData({
                          name: dept.name,
                          description: dept.description || '',
                          managerId: dept.manager?.email || '',
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {dept.name}
                </h3>
                
                {dept.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {dept.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {dept.manager && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4 mr-2" />
                      Manager: {dept.manager.email}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {dept.employees?.length || 0} employé(s)
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/departments/${dept.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir les détails →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingDept ? 'Modifier le département' : 'Nouveau département'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    Manager (email)
                  </label>
                  <input
                    type="email"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="manager@example.com"
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
                  {editingDept ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
