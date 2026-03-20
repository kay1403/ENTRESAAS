'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Shield, Calendar, Edit2, UserCircle, Save, X } from 'lucide-react';
import Layout from '@/components/Layout';

const profileSchema = z.object({
  email: z.string().email('Email invalide'),
  displayName: z.string().min(1, 'Le nom d\'affichage est requis').max(50, 'Trop long'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Charger le nom d'affichage depuis localStorage
    const savedName = localStorage.getItem('userDisplayName');
    if (savedName) {
      setDisplayName(savedName);
    } else if (user?.email) {
      const defaultName = user.email.split('@')[0];
      setDisplayName(defaultName);
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      displayName: displayName,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        displayName: displayName,
      });
    }
  }, [user, displayName, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      setIsLoading(true);
      
      // Sauvegarder le nom d'affichage localement
      localStorage.setItem('userDisplayName', data.displayName);
      setDisplayName(data.displayName);
      
      // Mettre à jour l'email si changé (uniquement côté frontend pour l'instant)
      if (data.email !== user?.email) {
        // Ici vous pouvez appeler l'API pour mettre à jour l'email
        // await api.updateUser(user!.id, { email: data.email });
        setUser({ ...user!, email: data.email });
      }
      
      // Changer le mot de passe si demandé
      if (data.newPassword && data.currentPassword) {
        try {
          await api.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });
          toast.success('Mot de passe modifié avec succès');
        } catch (error) {
          toast.error('Erreur lors du changement de mot de passe');
        }
      }
      
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                <UserCircle className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {displayName}
                </h2>
                <p className="text-blue-100 mt-1">{user.email}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Rôle: {user.roleId === 1 ? 'Administrateur' : user.roleId === 2 ? 'Manager' : 'Utilisateur'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nom d'affichage</p>
                      <p className="text-gray-900 dark:text-white font-medium">{displayName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.roleId === 1 ? 'Administrateur' : user.roleId === 2 ? 'Manager' : 'Utilisateur'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                      <p className="text-gray-900 dark:text-white">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier le profil
                  </button>
                  <button
                    onClick={() => router.push('/settings/2fa')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Configurer la 2FA
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom d'affichage
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Comment voulez-vous être appelé ?"
                  />
                  {errors.displayName && (
                    <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ce nom apparaîtra dans la barre de navigation et sur votre profil.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Changer le mot de passe (optionnel)
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mot de passe actuel
                      </label>
                      <input
                        {...register('currentPassword')}
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nouveau mot de passe
                      </label>
                      <input
                        {...register('newPassword')}
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirmer le mot de passe
                      </label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset({
                        email: user.email,
                        displayName: displayName,
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
