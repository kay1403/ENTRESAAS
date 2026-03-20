'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { File, Upload, Download, Trash2, Eye, FileText, Image, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user?: { email: string };
}

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await api.uploadDocument(file);
      toast.success('Document uploadé');
      loadDocuments();
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.deleteDocument(id);
      toast.success('Document supprimé');
      loadDocuments();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
    if (mimeType.includes('pdf')) return FileText;
    return File;
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Documents</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Upload zone */}
        <div className="mb-8">
          <label className="relative block">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {uploading ? 'Upload en cours...' : 'Cliquez ou déposez un fichier'}
              </p>
            </div>
          </label>
        </div>

        {/* Liste des documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Mes documents ({documents.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun document</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.mimeType);
                return (
                  <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center flex-1">
                      <Icon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.title || doc.fileName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                          {doc.user && ` • par ${doc.user.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`}
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-md"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-md"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-gray-600 hover:text-red-600 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
