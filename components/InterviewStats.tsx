'use client';

import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Award } from 'lucide-react';
import { useInterviewState } from '@/hooks/use-interview-state';

export function InterviewStats() {
  const { responses, getAverageScore, getSessionDuration, currentQuestion } = useInterviewState();
  
  const stats = [
    {
      label: 'Questions',
      value: currentQuestion,
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      label: 'Average Score',
      value: `${getAverageScore().toFixed(1)}/10`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
    },
    {
      label: 'Duration',
      value: `${getSessionDuration()}m`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600',
    },
    {
      label: 'Performance',
      value: getAverageScore() >= 8 ? 'Excellent' : getAverageScore() >= 6 ? 'Good' : 'Improving',
      icon: <Award className="w-5 h-5" />,
      color: getAverageScore() >= 8 ? 'text-green-600' : getAverageScore() >= 6 ? 'text-yellow-600' : 'text-red-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Interview Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 ${stat.color} mb-2`}>
              {stat.icon}
            </div>
            <div className="text-sm font-medium text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      {responses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-800 font-medium">{Math.min(currentQuestion * 10, 100)}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(currentQuestion * 10, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}