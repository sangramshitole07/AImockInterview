import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, RefreshCw, Brain, MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface InterviewSidebarProps {
  selectedLanguage: string;
  onShowTopicSelector: () => void;
  onResetInterview: () => void;
  onToggleHelp: () => void;
  onToggleStats?: () => void;
  onToggleSettings?: () => void;
  isInterviewActive: boolean;
}

export default function InterviewSidebar({
  selectedLanguage,
  onShowTopicSelector,
  onResetInterview,
  onToggleHelp,
  onToggleStats,
  onToggleSettings,
  isInterviewActive
}: InterviewSidebarProps) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-r border-[var(--chat-border)] z-30 shadow-xl"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-[var(--chat-border)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{background: 'linear-gradient(135deg,var(--apple-accent),var(--apple-accent-2))'}}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--apple-text)] dark:text-[#E0E0E0]">
                InterviewXP
              </h2>
              <p className="text-sm text-[var(--apple-subtext)] dark:text-gray-400">
                {selectedLanguage} Interview
              </p>
            </div>
          </div>
        </div>

        {/* Interview Controls */}
        <div className="flex-1 p-6 space-y-4">
          <Card className="border-[var(--chat-border)] bg-[var(--apple-card)] dark:bg-[#2C2C2E]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">
                Interview Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onShowTopicSelector}
                variant="outline"
                size="sm"
                className="w-full justify-start border-[var(--chat-border)] text-[var(--apple-text)] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Code className="w-4 h-4 mr-2" />
                Change Topic
              </Button>
              
              <Button
                onClick={onResetInterview}
                variant="outline"
                size="sm"
                className="w-full justify-start border-[var(--chat-border)] text-[var(--apple-text)] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Interview
              </Button>
              
              <Button
                onClick={onToggleHelp}
                variant="outline"
                size="sm"
                className="w-full justify-start border-[var(--chat-border)] text-[var(--apple-text)] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Get Help
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-[var(--chat-border)] bg-[var(--apple-card)] dark:bg-[#2C2C2E]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--apple-subtext)] dark:text-gray-400">Questions</span>
                <span className="font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--apple-subtext)] dark:text-gray-400">Score</span>
                <span className="font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">--</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--apple-subtext)] dark:text-gray-400">Time</span>
                <span className="font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">00:00</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="border-[var(--chat-border)] bg-[var(--apple-card)] dark:bg-[#2C2C2E]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--apple-text)] dark:text-[#E0E0E0]">
                Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onToggleStats && (
                <Button
                  onClick={onToggleStats}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-[var(--chat-border)] text-[var(--apple-text)] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Stats
                </Button>
              )}
              
              {onToggleSettings && (
                <Button
                  onClick={onToggleSettings}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-[var(--chat-border)] text-[var(--apple-text)] dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--chat-border)]">
          <div className="text-center">
            <p className="text-xs text-[var(--apple-subtext)] dark:text-gray-400">
              Powered by AI Interview Assistant
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
