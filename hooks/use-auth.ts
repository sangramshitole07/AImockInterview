'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    interviewStyle: 'technical' | 'behavioral' | 'mixed';
    difficulty: 'adaptive' | 'fixed';
    persona: 'faang' | 'startup' | 'enterprise' | 'academic';
  };
  profile: {
    selectedLanguages: string[];
    skillLevel: number;
    totalInterviews: number;
    averageScore: number;
    skillRatings: { [key: string]: number };
    recentPerformance: {
      date: string;
      language: string;
      score: number;
      questionsAnswered: number;
    }[];
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  recordInterview: (data: {
    language: string;
    score: number;
    questionsAnswered: number;
    skillRatings?: { [key: string]: number };
  }) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  _hasHydrated: false,
};

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Fetch full user data
          await get().fetchUser();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
          }

          // Fetch full user data
          await get().fetchUser();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if API call fails
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/me');
          
          if (response.ok) {
            const data = await response.json();
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Fetch user error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            const result = await response.json();
            set({ user: result.user });
          } else {
            throw new Error('Failed to update profile');
          }
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      },

      recordInterview: async (data) => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            // Refresh user data
            await get().fetchUser();
          } else {
            throw new Error('Failed to record interview');
          }
        } catch (error) {
          console.error('Record interview error:', error);
          throw error;
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.log('An error happened during hydration', error);
          } else {
            state?.setHasHydrated(true);
            // Fetch fresh user data on hydration
            if (state?.isAuthenticated) {
              state.fetchUser();
            }
          }
        };
      },
    }
  )
);