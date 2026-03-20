import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  roleId: number;
  isActive: boolean;
  companyId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      
      setAuth: (user, token) => {
        // Stocker dans le store
        set({ user, token, isLoading: false });
        
        // Stocker dans localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          
          // Stocker dans cookie pour le middleware (expire dans 7 jours)
          Cookies.set('accessToken', token, { 
            expires: 7, 
            path: '/',
            sameSite: 'lax'
          });
        }
      },
      
      setUser: (user) => set({ user }),
      
      logout: () => {
        set({ user: null, token: null });
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Supprimer le cookie
          Cookies.remove('accessToken', { path: '/' });
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      initialize: async () => {
        const { token, isInitialized } = get();
        
        if (isInitialized) return;
        
        // Chercher d'abord dans le store, puis dans le cookie
        let effectiveToken = token;
        
        if (!effectiveToken && typeof window !== 'undefined') {
          effectiveToken = Cookies.get('accessToken') || localStorage.getItem('accessToken');
        }
        
        if (!effectiveToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });
          const user = await api.getProfile();
          set({ 
            user, 
            token: effectiveToken, 
            isInitialized: true, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to load user profile:', error);
          get().logout();
          set({ isInitialized: true, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

interface User {
  id: number;
  email: string;
  roleId: number;
  isActive: boolean;
  employeeInfo?: {
    firstName: string;
    lastName: string;
  };
}
