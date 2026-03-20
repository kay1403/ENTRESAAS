'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Permission } from '@/lib/api';
import { Shield, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PermissionsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissionName, setPermissionName] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error('Error loading permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionName.trim()) {
      toast.error('Permission name is required');
      return;
    }

    try {
      if (editingPermission) {
        await api.updatePermission(editingPermission.id, permissionName);
        toast.success('Permission updated successfully');
      } else {
        await api.createPermission(permissionName);
        toast.success('Permission created successfully');
      }
      setShowModal(false);
      resetForm();
      loadPermissions();
    } catch (error) {
      toast.error(editingPermission ? 'Error updating permission' : 'Error creating permission');
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionName(permission.name);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permission? It may be used by roles.')) return;
    try {
      await api.deletePermission(id);
      toast.success('Permission deleted successfully');
      loadPermissions();
    } catch (error) {
      toast.error('Error deleting permission');
    }
  };

  const resetForm = () => {
    setEditingPermission(null);
    setPermissionName('');
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
              <h1 className="text-xl font-bold text-gray-900">Permissions Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">All Permissions</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Permission
          </button>
        </div>

        {/* Permissions Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading permissions...</p>
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No permissions yet</h3>
            <p className="mt-2 text-gray-600">Get started by creating your first permission.</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Permission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{permission.name}</h3>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(permission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(permission)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md"
                      title="Edit permission"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(permission.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md"
                      title="Delete permission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPermission ? 'Edit Permission' : 'Create New Permission'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                  placeholder="e.g., users:read, roles:write"
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use format: resource:action (e.g., users:read)
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  {editingPermission ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
