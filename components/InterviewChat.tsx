'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviewState } from '@/hooks/use-interview-state';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

interface InterviewChatProps {
  isPopupOpen: boolean;
  onTogglePopup: (open: boolean) => void;
}

export function InterviewChat({ isPopupOpen, onTogglePopup }: InterviewChatProps) {
  const { selectedLanguage, responses, getAverageScore } = useInterviewState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // A more robust auto-scrolling function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && !isScrollingRef.current) {
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

  // Effect to handle initial welcome message
  useEffect(() => {
    if (isPopupOpen && messages.length === 0 && selectedLanguage) {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: `Welcome to your ${selectedLanguage} technical interview! I'm your senior technical recruiter and I'll be conducting this comprehensive interview session.

I'll start with some foundational questions and gradually increase the complexity based on your performance. I'm looking for both technical knowledge and problem-solving approach.

Let's begin with your first question!`,
          timestamp: new Date(),
        }
      ]);
      // Scroll to bottom after initial message is rendered
      setTimeout(scrollToBottom, 50); 
    }
  }, [isPopupOpen, selectedLanguage, messages.length, scrollToBottom]);

  // Core auto-scrolling effect for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Debounce scroll to bottom
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, scrollToBottom]);

  // Simulated fetch for older messages (for endless scroll)
  const fetchOlderMessages = useCallback(() => {
    if (isFetchingOlderMessages) return;

    setIsFetchingOlderMessages(true);
    console.log('Fetching older messages...');

    // Simulate network delay
    setTimeout(() => {
      const olderMessages: ChatMessage[] = [
        // Dummy data for demonstration
        {
          id: (Date.now() - 3).toString(),
          type: 'assistant',
          content: 'This is a past question I asked you.',
          timestamp: new Date(Date.now() - 100000),
        },
        {
          id: (Date.now() - 2).toString(),
          type: 'user',
          content: 'This is a past answer I gave.',
          timestamp: new Date(Date.now() - 90000),
        }
      ];
      setMessages(prev => [...olderMessages, ...prev]);
      setIsFetchingOlderMessages(false);
    }, 1500);
  }, [isFetchingOlderMessages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    // Track if user is manually scrolling
    isScrollingRef.current = !isAtBottom;
    
    // Check if the user has scrolled to the top for loading older messages
    if (container.scrollTop === 0) {
      fetchOlderMessages();
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // This is where your real CopilotKit API call would go
    // For this example, we'll keep the simulated response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Thank you for your answer! I can see you have a good understanding of the concept. Let me provide some feedback and ask the next question.

**Score: 8/10**

**Feedback:**
- Good understanding of the core concept
- Could improve on edge cases
- Consider performance implications

**Next Question:**
Can you explain how you would handle error cases in this scenario?`,
        timestamp: new Date(),
        score: 8,
        feedback: 'Good understanding of the core concept. Could improve on edge cases and performance implications.'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current?.value) {
      handleSendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  const handleSendButtonClick = () => {
    if (inputRef.current?.value) {
      handleSendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-[600px] shadow-lg flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Interview Chat</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{responses.length} questions completed</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* Loading older messages indicator */}
          <AnimatePresence>
            {isFetchingOlderMessages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-2"
              >
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {message.score && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-xs">
                          <Sparkles className="w-3 h-3" />
                          <span className="font-medium">Score: {message.score}/10</span>
                        </div>
                        {message.feedback && (
                          <p className="text-xs mt-1 opacity-80">{message.feedback}</p>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your answer here..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={handleInputKeyPress}
            />
            <Button
              onClick={handleSendButtonClick}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Tip: Be detailed in your answers and explain your reasoning
          </div>
        </div>
      </CardContent>
    </Card>
  );
}