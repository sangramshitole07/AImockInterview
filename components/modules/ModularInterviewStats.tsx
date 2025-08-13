'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Award, Brain, Code, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userProfileModule, feedbackScoringModule } from '@/lib/modules';

export function ModularInterviewStats() {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const updateStats = () => {
      const currentProfile = userProfileModule.getProfile();
      const profileStats = userProfileModule.getStats();
      
      setProfile(currentProfile);
      setStats(profileStats);
    };

    updateStats();
    
    // Update stats every 5 seconds during active interview
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!profile || !stats) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <span>Interview Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>No active interview session</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayStats = [
    {
      label: 'Language',
      value: profile.selectedLanguage || 'Not selected',
      icon: <Code className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      label: 'Skill Level',
      value: `${profile.skillLevel}/5`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
    },
    {
      label: 'Sessions',
      value: stats.totalSessions,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600',
    },
    {
      label: 'Avg Score',
      value: stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}/10` : 'N/A',
      icon: <Award className="w-5 h-5" />,
      color: stats.averageScore >= 8 ? 'text-green-600' : 
             stats.averageScore >= 6 ? 'text-yellow-600' : 'text-red-600',
    },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <span>Interview Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {displayStats.map((stat, index) => (
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

        {/* Progress Indicators */}
        {stats.completedSessions > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-800 font-medium">
                {stats.completedSessions} sessions completed
              </span>
            </div>
            
            {/* Recent Performance */}
            {stats.recentPerformance.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Recent Performance</div>
                <div className="flex space-x-1">
                  {stats.recentPerformance.map((score: number, index: number) => (
                    <div
                      key={index}
                      className={`h-8 flex-1 rounded ${
                        score >= 8 ? 'bg-green-500' :
                        score >= 6 ? 'bg-yellow-500' :
                        score >= 4 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      title={`Session ${index + 1}: ${score}/10`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Languages Practiced */}
            {stats.languages.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Languages Practiced</div>
                <div className="flex flex-wrap gap-2">
                  {stats.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Insights */}
        {stats.averageScore > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Performance Insight</span>
            </div>
            <p className="text-sm text-blue-700">
              {stats.averageScore >= 8 
                ? "Excellent work! You're demonstrating strong technical skills."
                : stats.averageScore >= 6
                ? "Good progress! Keep practicing to reach the next level."
                : "Keep learning! Focus on fundamentals to improve your scores."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}