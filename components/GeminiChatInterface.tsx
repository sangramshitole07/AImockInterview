'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilotChat, useCopilotAction } from '@copilotkit/react-core';
import { 
  Brain, 
  User, 
  Send, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useInterviewState } from '@/hooks/use-interview-state';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  score?: number;
  feedback?: string;
}

interface GeminiChatInterfaceProps {
  selectedLanguage: string;
  interviewerPrompt: string;
  onClose: () => void;
}

export function GeminiChatInterface({ 
  selectedLanguage, 
  interviewerPrompt, 
  onClose 
}: GeminiChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { responses, addResponse } = useInterviewState();
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your ${selectedLanguage} technical interviewer. I'm here to conduct a comprehensive technical interview to assess your programming knowledge and problem-solving skills.

I'll be asking you questions of varying difficulty levels, starting with fundamentals and progressing to more advanced topics based on your performance. 

**What to expect:**
• Technical questions about ${selectedLanguage}
• Code analysis and debugging challenges  
• Algorithm and data structure problems
• Best practices and design patterns

**Tips for success:**
• Explain your thought process clearly
• Ask clarifying questions if needed
• Consider edge cases in your solutions
• Don't hesitate to discuss trade-offs

Are you ready to begin your ${selectedLanguage} technical interview?`,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, [selectedLanguage]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    // Debounce scroll to bottom to prevent excessive calls
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, scrollToBottom]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate AI response (in real implementation, this would use CopilotKit)
      setTimeout(() => {
        const score = Math.floor(Math.random() * 4) + 7;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateInterviewResponse(userMessage.content, score),
          timestamp: new Date(),
          score,
          feedback: generateFeedback(score),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        addResponse({
          question: 'Interview Question',
          answer: userMessage.content,
          score,
          feedback: generateFeedback(score),
        });
      }, 1500 + Math.random() * 1000);
    } catch (err: any) {
      setIsTyping(false);
      toast({
        title: 'Failed to send message',
        description: err?.message || 'Unknown error occurred while generating response',
      });
    }
  }, [inputValue, isTyping, addResponse, toast]);

  const generateInterviewResponse = (userAnswer: string, score: number): string => {
    const responses = [
      `Thank you for your detailed answer! Let me provide some feedback and move to the next question.

**Your Response Analysis:**
You demonstrated ${score >= 8 ? 'excellent' : score >= 6 ? 'good' : 'basic'} understanding of the concept. ${score >= 8 ? 'Your explanation was clear and comprehensive.' : score >= 6 ? 'There are some areas we can improve on.' : 'Let\'s work on strengthening your fundamentals.'}

**Score: ${score}/10**

**Next Question:**
Can you explain the difference between synchronous and asynchronous programming in ${selectedLanguage}? Please provide examples and discuss when you would use each approach.`,

      `Great effort on that question! Here's my assessment:

**Performance Evaluation:**
${score >= 8 ? 'Outstanding! You covered all the key points and showed deep understanding.' : score >= 6 ? 'Solid answer with room for improvement in some areas.' : 'Good attempt, but let\'s focus on the core concepts.'}

**Score: ${score}/10**

**Follow-up Question:**
Now let's dive into error handling. How would you implement robust error handling in a ${selectedLanguage} application? What are the best practices you follow?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateFeedback = (score: number): string => {
    if (score >= 9) return "Excellent understanding with comprehensive explanation";
    if (score >= 7) return "Good grasp of concepts with minor areas for improvement";
    if (score >= 5) return "Basic understanding shown, needs more depth";
    return "Requires significant improvement in fundamentals";
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    // Only auto-scroll if user is near the bottom
    if (isAtBottom) {
      isScrollingRef.current = false;
    } else {
      isScrollingRef.current = true;
    }
  }, []);
  // Text-to-speech functionality
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isMinimized ? '60px' : isFullscreen ? '100vh' : '80vh'
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}
        ${isMinimized ? 'h-16' : ''}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>{selectedLanguage} AI Interviewer</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-sm text-gray-600">
                {isTyping ? 'Analyzing your response...' : 'Ready to continue'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 max-h-[calc(80vh-200px)] bg-gradient-to-b from-gray-50/30 to-white gemini-scrollbar"
            style={{
              scrollBehavior: 'smooth',
              overflowAnchor: 'auto'
            }}
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: Math.min(index * 0.05, 0.2),
                    ease: "easeOut"
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ contain: 'layout style paint' }}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      }
                    `}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`
                      rounded-2xl px-4 py-3 shadow-sm
                      ${message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }
                    `}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed copilot-chat-message-content">
                        {message.content}
                      </div>
                      
                      {/* Score and Feedback */}
                      {message.score && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-xs">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="font-medium">Score: {message.score}/10</span>
                          </div>
                          {message.feedback && (
                            <p className="text-xs mt-1 text-gray-600">{message.feedback}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                        
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.content)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSpeak(message.content)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[44px] max-h-32 resize-none border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  disabled={isTyping}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {inputValue.length}/2000
                </div>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>💡 Tip: Explain your reasoning and consider edge cases</span>
              <span>Questions answered: {responses.length}</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}