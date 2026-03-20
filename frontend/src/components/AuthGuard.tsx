'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Loader from './Loader';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Routes publiques
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    
    if (!user && !publicRoutes.includes(pathname)) {
      router.push('/login');
      return;
    }

    if (user && publicRoutes.includes(pathname)) {
      router.push('/dashboard');
      return;
    }
  }, [user, isInitialized, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Chargement..." />
      </div>
    );
  }

  return <>{children}</>;
}
