'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Receipt, Plus, Edit, Trash2, Eye, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
}

interface Expense {
  id: number;
  category: { name: string };
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  receiptUrl?: string;
}

export default function ExpensePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 0,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        api.getMyExpenses(),
        api.getExpenseCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let categoryId = formData.categoryId;
    
    // Si l'utilisateur a choisi "Autre" et a saisi un nom personnalisé
    if (categoryId === -1 && customCategory.trim()) {
      try {
        // Créer une nouvelle catégorie
        const newCategory = await api.createExpenseCategory({ name: customCategory.trim() });
        categoryId = newCategory.id;
        // Recharger les catégories
        const updatedCategories = await api.getExpenseCategories();
        setCategories(updatedCategories);
        toast.success(`Catégorie "${customCategory}" créée`);
      } catch (error) {
        toast.error('Erreur lors de la création de la catégorie');
        return;
      }
    }

    try {
      await api.createExpense({
        ...formData,
        categoryId,
        amount: parseFloat(formData.amount),
      });
      toast.success('Note de frais créée');
      setShowModal(false);
      setCustomCategory('');
      setShowCustomCategory(false);
      setFormData({
        categoryId: 0,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return 'badge-success';
      case 'APPROVED': return 'badge-info';
      case 'REJECTED': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PAID': return 'Payé';
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Refusé';
      default: return 'En attente';
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingAmount = expenses
    .filter(exp => exp.status === 'SUBMITTED')
    .reduce((sum, exp) => sum + exp.amount, 0);

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notes de frais</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalAmount.toFixed(2)} €
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {pendingAmount.toFixed(2)} €
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de notes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {expenses.length}
            </p>
          </div>
        </div>

        {/* Bouton nouvelle note */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowModal(true);
              setShowCustomCategory(false);
              setCustomCategory('');
              setFormData({ ...formData, categoryId: 0 });
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle note de frais
          </button>
        </div>

        {/* Liste des notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mes notes de frais</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucune note de frais</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {expense.amount.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${getStatusBadge(expense.status)}`}>
                          {getStatusText(expense.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {expense.receiptUrl && (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-600 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          {expense.status === 'SUBMITTED' && (
                            <>
                              <button className="p-1 text-gray-600 hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de création avec catégorie personnalisable */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Nouvelle note de frais
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({ ...formData, categoryId: val });
                      setShowCustomCategory(val === -1);
                      if (val !== -1) setCustomCategory('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="-1">+ Autre (créer une nouvelle catégorie)</option>
                  </select>
                </div>

                {showCustomCategory && (
                  <div className="animate-slideIn">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nouvelle catégorie
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Ex: Fournitures, Formation, Restaurant, Taxi..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      <PlusCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Cette catégorie sera ajoutée à votre liste
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    placeholder="Détails de la dépense..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCustomCategory('');
                    setShowCustomCategory(false);
                  }}
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
