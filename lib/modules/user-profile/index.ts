// User Profile Module - Manages user preferences and interview history

import { UserProfile, InterviewSession } from '../types';

export class UserProfileModule {
  private static instance: UserProfileModule;
  private userProfile: UserProfile | null = null;

  private constructor() {}

  static getInstance(): UserProfileModule {
    if (!UserProfileModule.instance) {
      UserProfileModule.instance = new UserProfileModule();
    }
    return UserProfileModule.instance;
  }

  // Initialize user profile
  initializeProfile(userId: string): UserProfile {
    this.userProfile = {
      id: userId,
      selectedLanguage: null,
      skillLevel: 1,
      preferences: {
        interviewStyle: 'technical',
        difficulty: 'adaptive',
        persona: 'faang',
      },
      history: [],
    };
    return this.userProfile;
  }

  // Update language selection
  setLanguage(language: string): void {
    if (this.userProfile) {
      this.userProfile.selectedLanguage = language;
      this.saveProfile();
    }
  }

  // Update skill level
  setSkillLevel(level: 1 | 2 | 3 | 4 | 5): void {
    if (this.userProfile) {
      this.userProfile.skillLevel = level;
      this.saveProfile();
    }
  }

  // Get current profile
  getProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Add interview session to history
  addSession(session: InterviewSession): void {
    if (this.userProfile) {
      this.userProfile.history.push(session);
      this.saveProfile();
    }
  }

  // Get interview statistics
  getStats() {
    if (!this.userProfile) return null;

    const sessions = this.userProfile.history;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const averageScore = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.overallScore, 0) / completedSessions.length 
      : 0;

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      averageScore,
      languages: Array.from(new Set(sessions.map((s) => s.language))),
      recentPerformance: sessions.slice(-5).map(s => s.overallScore),
    };
  }

  // Save profile to localStorage
  private saveProfile(): void {
    if (this.userProfile) {
      localStorage.setItem('interviewxp-profile', JSON.stringify(this.userProfile));
    }
  }

  // Load profile from localStorage
  loadProfile(): UserProfile | null {
    try {
      const saved = localStorage.getItem('interviewxp-profile');
      if (saved) {
        this.userProfile = JSON.parse(saved);
        return this.userProfile;
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    return null;
  }

  // Clear profile
  clearProfile(): void {
    this.userProfile = null;
    localStorage.removeItem('interviewxp-profile');
  }
}

export const userProfileModule = UserProfileModule.getInstance();