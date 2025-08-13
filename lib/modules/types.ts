// Core types for the modular architecture

export interface UserProfile {
  id: string;
  selectedLanguage: string | null;
  skillLevel: 1 | 2 | 3 | 4 | 5;
  preferences: {
    interviewStyle: 'technical' | 'behavioral' | 'mixed';
    difficulty: 'adaptive' | 'fixed';
    persona: 'faang' | 'startup' | 'enterprise' | 'academic';
  };
  history: InterviewSession[];
}

export interface InterviewSession {
  id: string;
  language: string;
  skillLevel: number;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  overallScore: number;
  feedback: string;
  status: 'active' | 'completed' | 'paused';
}

export interface InterviewQuestion {
  id: string;
  type: 'MCQ' | 'Code Analysis' | 'Code Completion' | 'DSA Challenge';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  question: string;
  codeSnippet?: string;
  options?: string[];
  expectedAnswer?: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
  timestamp: Date;
}

export interface QuestionGenerationContext {
  language: string;
  skillLevel: number;
  previousQuestions: InterviewQuestion[];
  currentPerformance: {
    averageScore: number;
    strengths: string[];
    weaknesses: string[];
  };
  sessionDuration: number;
  trendingTopics?: string[];
}

export interface FeedbackResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextQuestionSuggestion?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    score?: number;
    feedback?: string;
    type?: string;
  };
}

export interface ModuleConfig {
  chat: {
    maxMessages: number;
    autoScroll: boolean;
    enableSpeech: boolean;
  };
  questionGeneration: {
    maxQuestionsPerSession: number;
    adaptiveDifficulty: boolean;
    includeCodeSnippets: boolean;
  };
  feedback: {
    detailedAnalysis: boolean;
    suggestResources: boolean;
    trackProgress: boolean;
  };
}