'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const response = await api.login(data.email, data.password);
      
      // Mettre à jour le store (qui va aussi créer le cookie)
      setAuth(response.user, response.accessToken);
      
      // Vérifier que le cookie est bien créé
      console.log('Cookie après login:', Cookies.get('accessToken'));
      
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Email ou mot de passe invalide');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ENTRESAAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connectez-vous à votre espace
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                placeholder="vous@exemple.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                {...register('password')}
                type="password"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Créer un compte
              </Link>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
