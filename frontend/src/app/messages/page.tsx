'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MessageSquare, Send, Inbox, Star, Trash2, MailOpen, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  sender: { email: string };
  subject?: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendMessage(formData);
      toast.success('Message envoyé');
      setShowCompose(false);
      loadMessages();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markMessageAsRead(id);
      loadMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const inboxCount = messages.filter(m => !m.isRead).length;

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Nouveau message
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <span className="flex items-center">
                    <Inbox className="h-5 w-5 mr-3" />
                    Boîte de réception
                  </span>
                  {inboxCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {inboxCount}
                    </span>
                  )}
                </button>
                <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <Send className="h-5 w-5 mr-3" />
                  Envoyés
                </button>
                <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <Star className="h-5 w-5 mr-3" />
                  Favoris
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <button className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                  <Trash2 className="h-5 w-5 mr-3" />
                  Corbeille
                </button>
              </div>
            </div>
          </div>

          {/* Liste des messages */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Aucun message</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !message.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) handleMarkAsRead(message.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {!message.isRead ? (
                            <Mail className="h-4 w-4 text-blue-600 mr-2" />
                          ) : (
                            <MailOpen className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {message.sender.email}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {message.subject && (
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {message.subject}
                        </h3>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de composition */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Nouveau message
            </h2>
            <form onSubmit={handleSend}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destinataire
                  </label>
                  <input
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
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

      {/* Modal de lecture */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Message
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">De: {selectedMessage.sender.email}</p>
                {selectedMessage.subject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sujet: {selectedMessage.subject}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
