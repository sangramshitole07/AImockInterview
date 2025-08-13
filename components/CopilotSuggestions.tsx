'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Code, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInterviewState } from '@/hooks/use-interview-state';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  type: 'tip' | 'resource' | 'practice' | 'concept';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action?: string;
}

interface CopilotSuggestionsProps {
  isVisible: boolean;
}

export function CopilotSuggestions({ isVisible }: CopilotSuggestionsProps) {
  const { selectedLanguage, responses, getAverageScore } = useInterviewState();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && selectedLanguage) {
      generateSuggestions();
    }
  }, [isVisible, selectedLanguage, responses.length]);

  const generateSuggestions = () => {
    const avgScore = getAverageScore();
    const questionCount = responses.length;
    
    const baseSuggestions: Suggestion[] = [
      {
        id: '1',
        type: 'tip',
        title: 'Use the Interviewer Chat',
        description: 'Click "Start Interview" to begin your formal interview session with the AI interviewer.',
        icon: <Lightbulb className="w-5 h-5" />,
        color: 'from-purple-400 to-blue-500',
      },
      {
        id: '2',
        type: 'tip',
        title: 'Get Help from Assistant',
        description: 'Use the "Get Help" button to ask the AI assistant for hints, explanations, and guidance.',
        icon: <Target className="w-5 h-5" />,
        color: 'from-green-400 to-teal-500',
      },
      {
        id: '3',
        type: 'concept',
        title: 'Two AI Agents Available',
        description: 'Interviewer: Conducts the formal interview. Assistant: Provides hints and guidance.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-blue-400 to-cyan-500',
      },
    ];

    // Add language-specific suggestions
    const languageSuggestions: Suggestion[] = selectedLanguage === 'JavaScript' ? [
      {
        id: '4',
        type: 'concept',
        title: 'ES6+ Features',
        description: 'Demonstrate knowledge of arrow functions, destructuring, and modern JavaScript patterns.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-yellow-500 to-orange-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Async Programming',
        description: 'Show understanding of Promises, async/await, and asynchronous patterns.',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'from-purple-400 to-pink-500',
      },
    ] : selectedLanguage === 'React' ? [
      {
        id: '4',
        type: 'concept',
        title: 'Component Lifecycle',
        description: 'Understand hooks, state management, and component optimization techniques.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-cyan-500 to-blue-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Performance Optimization',
        description: 'Learn about React.memo, useMemo, useCallback, and rendering optimization.',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'from-blue-400 to-cyan-500',
      },
    ] : selectedLanguage === 'Data Science' ? [
      {
        id: '4',
        type: 'concept',
        title: 'Statistical Analysis',
        description: 'Demonstrate knowledge of statistical methods, hypothesis testing, and data interpretation.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-purple-500 to-pink-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Data Visualization',
        description: 'Show proficiency in creating meaningful visualizations and insights from data.',
        icon: <Target className="w-5 h-5" />,
        color: 'from-pink-500 to-rose-600',
      },
    ] : selectedLanguage === 'Machine Learning' ? [
      {
        id: '4',
        type: 'concept',
        title: 'Model Selection',
        description: 'Understand different ML algorithms and when to apply each approach.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-indigo-500 to-purple-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Model Evaluation',
        description: 'Learn about cross-validation, metrics, and avoiding overfitting.',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'from-purple-500 to-indigo-600',
      },
    ] : selectedLanguage === 'Python' ? [
      {
        id: '4',
        type: 'concept',
        title: 'Pythonic Code',
        description: 'Use list comprehensions, context managers, and Python-specific idioms.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-blue-500 to-green-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Exception Handling',
        description: 'Demonstrate proper use of try/except blocks and the EAFP principle.',
        icon: <Target className="w-5 h-5" />,
        color: 'from-green-500 to-teal-600',
      },
    ] : selectedLanguage === 'Java' ? [
      {
        id: '4',
        type: 'concept',
        title: 'OOP Principles',
        description: 'Show understanding of encapsulation, inheritance, and polymorphism.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-red-500 to-orange-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Collections Framework',
        description: 'Demonstrate knowledge of ArrayList, HashMap, and other collection types.',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'from-blue-500 to-purple-600',
      },
    ] : selectedLanguage?.includes('Data Structures') ? [
      {
        id: '4',
        type: 'concept',
        title: 'Algorithm Complexity',
        description: 'Understand Big O notation and analyze time/space complexity of algorithms.',
        icon: <Code className="w-5 h-5" />,
        color: 'from-emerald-500 to-teal-600',
      },
      {
        id: '5',
        type: 'concept',
        title: 'Problem Solving',
        description: 'Apply appropriate data structures and algorithms to solve complex problems.',
        icon: <Target className="w-5 h-5" />,
        color: 'from-teal-500 to-cyan-600',
      },
    ] : [];

    // Add performance-based suggestions
    const performanceSuggestions: Suggestion[] = avgScore < 6 ? [
      {
        id: '6',
        type: 'tip',
        title: 'Review Fundamentals',
        description: 'Focus on core concepts and basic syntax. Don\'t rush - accuracy is more important than speed.',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'from-red-400 to-pink-500',
      },
    ] : avgScore >= 8 ? [
      {
        id: '6',
        type: 'tip',
        title: 'Challenge Yourself',
        description: 'You\'re doing great! Try to provide more detailed explanations and edge case considerations.',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'from-green-500 to-emerald-600',
      },
    ] : [];

    try {
      const allSuggestions = [...baseSuggestions, ...languageSuggestions, ...performanceSuggestions];
      setSuggestions(allSuggestions);
    } catch (err: any) {
      toast({
        title: 'Suggestions error',
        description: err?.message || 'Failed to generate suggestions.',
      });
    }
  };

  useEffect(() => {
    if (suggestions.length > 0) {
      const interval = setInterval(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      }, 5000); // Change suggestion every 5 seconds

      return () => clearInterval(interval);
    }
  }, [suggestions.length]);

  if (!isVisible || suggestions.length === 0) return null;

  const currentSuggestion = suggestions[currentSuggestionIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSuggestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${currentSuggestion.color} text-white`}>
                {currentSuggestion.icon}
              </div>
              <span className="text-gray-800">{currentSuggestion.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600">{currentSuggestion.description}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-1">
                {suggestions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentSuggestionIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Next Tip
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 