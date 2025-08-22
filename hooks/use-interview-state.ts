'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuth } from './use-auth';

export interface InterviewResponse {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  timestamp: Date;
}

export interface InterviewState {
  isInterviewActive: boolean;
  selectedLanguage: string | null;
  currentQuestion: number;
  totalScore: number;
  responses: InterviewResponse[];
  sessionStartTime: Date | null;
  _hasHydrated: boolean;
}

interface InterviewStore extends InterviewState {
  startInterview: (language: string) => void;
  addResponse: (response: Omit<InterviewResponse, 'timestamp'>) => void;
  resetInterview: () => void;
  getAverageScore: () => number;
  getSessionDuration: () => number;
  setHasHydrated: (state: boolean) => void;
}

const initialState: InterviewState = {
  isInterviewActive: false,
  selectedLanguage: null,
  currentQuestion: 0,
  totalScore: 0,
  responses: [],
  sessionStartTime: null,
  _hasHydrated: false,
};

export const useInterviewState = create<InterviewStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startInterview: (language: string) => {
        set({
          isInterviewActive: true,
          selectedLanguage: language,
          currentQuestion: 0,
          totalScore: 0,
          responses: [],
          sessionStartTime: new Date(),
        });
      },
      
      addResponse: (response: Omit<InterviewResponse, 'timestamp'>) => {
        const state = get();
        const newResponse: InterviewResponse = {
          ...response,
          timestamp: new Date(),
        };
        
        set({
          currentQuestion: state.currentQuestion + 1,
          totalScore: state.totalScore + response.score,
          responses: [...state.responses, newResponse],
        });
        
        // Record interview data if user is authenticated
        if (typeof window !== 'undefined') {
          try {
            const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            if (authState?.state?.isAuthenticated && state.selectedLanguage) {
              fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  language: state.selectedLanguage,
                  score: response.score,
                  questionsAnswered: 1,
                  skillRatings: {
                    [state.selectedLanguage]: response.score,
                  },
                }),
              }).catch(console.error);
            }
          } catch (error) {
            console.error('Failed to record interview data:', error);
          }
        }
      },
      
      resetInterview: () => {
        set(initialState);
      },
      
      getAverageScore: () => {
        const { responses } = get();
        if (responses.length === 0) return 0;
        return responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
      },
      
      getSessionDuration: () => {
        const { sessionStartTime } = get();
        if (!sessionStartTime) return 0;
        return Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60); // minutes
      },
      
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'interview-state',
      partialize: (state) => ({
        responses: state.responses,
        selectedLanguage: state.selectedLanguage,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.log('An error happened during hydration', error);
          } else {
            state?.setHasHydrated(true);
          }
        };
      },
    }
  )
);