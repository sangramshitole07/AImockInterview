// Central module exports and orchestration
import { userProfileModule } from './user-profile';
import { chatModule } from './chat';

export { userProfileModule, UserProfileModule } from './user-profile';
export { questionGenerationModule, QuestionGenerationModule } from './question-generation';
export { feedbackScoringModule, FeedbackScoringModule } from './feedback-scoring';
export { chatModule, ChatModule } from './chat';

export * from './types';

// Module orchestrator for coordinating between modules
export class ModuleOrchestrator {
  private static instance: ModuleOrchestrator;

  private constructor() {}

  static getInstance(): ModuleOrchestrator {
    if (!ModuleOrchestrator.instance) {
      ModuleOrchestrator.instance = new ModuleOrchestrator();
    }
    return ModuleOrchestrator.instance;
  }

  // Initialize all modules
  async initialize() {
    // Load user profile if exists
    userProfileModule.loadProfile();
    
    // Initialize chat session
    chatModule.initializeSession();
    
    console.log('InterviewXP modules initialized successfully');
  }

  // Start new interview session
  async startNewSession() {
    // Clear existing data
    userProfileModule.clearProfile();
    chatModule.clearChat();
    
    // Initialize new profile
    userProfileModule.initializeProfile('user-' + Date.now());
    
    // Start chat
    return chatModule.initializeSession();
  }

  // Get session status
  getSessionStatus() {
    const profile = userProfileModule.getProfile();
    const sessionState = chatModule.getSessionState();
    
    return {
      hasProfile: !!profile,
      language: profile?.selectedLanguage,
      skillLevel: profile?.skillLevel,
      sessionState,
      isActive: sessionState !== 'completed',
    };
  }
}

export const moduleOrchestrator = ModuleOrchestrator.getInstance();