'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Award,
  Brain,
  Code,
  BarChart3,
  Sparkles,
  ArrowRight,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isLoading, logout, _hasHydrated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, _hasHydrated, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        description: 'See you next time!',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const startInterview = (language?: string) => {
    if (language) {
      router.push(`/?lang=${encodeURIComponent(language)}`);
    } else {
      router.push('/');
    }
  };

  const getSkillLevel = (score: number) => {
    if (score >= 9) return { level: 'Expert', color: 'bg-purple-500' };
    if (score >= 7) return { level: 'Advanced', color: 'bg-blue-500' };
    if (score >= 5) return { level: 'Intermediate', color: 'bg-green-500' };
    if (score >= 3) return { level: 'Beginner', color: 'bg-yellow-500' };
    return { level: 'Novice', color: 'bg-gray-500' };
  };

  const getPersonalizedSuggestions = () => {
    if (!user) return [];

    const suggestions = [];
    const { profile } = user;

    // Based on recent performance
    const recentPerformance = profile.recentPerformance.slice(-3);
    const averageRecentScore = recentPerformance.length > 0 
      ? recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length 
      : 0;

    if (averageRecentScore < 6) {
      suggestions.push({
        title: 'Strengthen Fundamentals',
        description: 'Your recent scores suggest focusing on core concepts would be beneficial.',
        language: 'JavaScript',
        priority: 'high',
        reason: 'Based on recent performance trends'
      });
    }

    // Based on skill ratings
    const skillEntries = Object.entries(profile.skillRatings || {});
    const weakSkills = skillEntries.filter(([_, rating]) => rating < 6);
    
    if (weakSkills.length > 0) {
      const [skill, rating] = weakSkills[0];
      suggestions.push({
        title: `Improve ${skill}`,
        description: `Your current rating is ${rating}/10. Practice more to strengthen this area.`,
        language: skill,
        priority: 'medium',
        reason: `Current skill rating: ${rating}/10`
      });
    }

    // Based on languages practiced
    const languages = profile.selectedLanguages || [];
    if (languages.length === 0) {
      suggestions.push({
        title: 'Start with JavaScript',
        description: 'JavaScript is a great language to begin your interview preparation.',
        language: 'JavaScript',
        priority: 'high',
        reason: 'Recommended for beginners'
      });
    } else if (languages.length < 3) {
      const nextLanguages = ['Python', 'Java', 'TypeScript', 'React'].filter(
        lang => !languages.includes(lang)
      );
      if (nextLanguages.length > 0) {
        suggestions.push({
          title: `Expand to ${nextLanguages[0]}`,
          description: `Broaden your skills by learning ${nextLanguages[0]} concepts.`,
          language: nextLanguages[0],
          priority: 'low',
          reason: 'Skill diversification'
        });
      }
    }

    // Based on total interviews
    if (profile.totalInterviews < 5) {
      suggestions.push({
        title: 'Build Interview Confidence',
        description: 'Complete more practice sessions to build your confidence.',
        language: languages[0] || 'JavaScript',
        priority: 'medium',
        reason: 'Limited interview experience'
      });
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen animated-bg dark:animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const suggestions = getPersonalizedSuggestions();

  return (
    <div className="min-h-screen animated-bg dark:animated-bg">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InterviewXP</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-gray-600 mt-1">
                Ready to continue your interview preparation journey?
              </p>
            </div>
            <Button
              onClick={() => startInterview()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Interview
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Profile Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {user.profile.totalInterviews}
                      </div>
                      <div className="text-sm text-gray-600">Total Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {user.profile.averageScore.toFixed(1)}/10
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {user.profile.selectedLanguages.length}
                      </div>
                      <div className="text-sm text-gray-600">Languages</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm text-gray-600">
                        {Math.min(user.profile.totalInterviews * 10, 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(user.profile.totalInterviews * 10, 100)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Recent Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.profile.recentPerformance.length > 0 ? (
                    <div className="space-y-3">
                      {user.profile.recentPerformance.slice(-5).reverse().map((performance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Code className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{performance.language}</div>
                              <div className="text-sm text-gray-600">
                                {performance.questionsAnswered} questions • {new Date(performance.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              performance.score >= 8 ? 'text-green-600' : 
                              performance.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {performance.score}/10
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No interview data yet</p>
                      <p className="text-sm text-gray-500">Complete your first interview to see performance metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skill Ratings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Skill Ratings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(user.profile.skillRatings || {}).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(user.profile.skillRatings).map(([skill, rating]) => {
                        const skillInfo = getSkillLevel(rating);
                        return (
                          <div key={skill} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{skill}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className={`${skillInfo.color} text-white`}>
                                  {skillInfo.level}
                                </Badge>
                                <span className="text-sm font-bold text-gray-700">{rating}/10</span>
                              </div>
                            </div>
                            <Progress value={rating * 10} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No skill ratings yet</p>
                      <p className="text-sm text-gray-500">Complete interviews to build your skill profile</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Suggestions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>Personalized Suggestions</span>
                  </CardTitle>
                  <CardDescription>
                    Based on your performance and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <Badge 
                            variant={suggestion.priority === 'high' ? 'destructive' : 
                                   suggestion.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{suggestion.reason}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startInterview(suggestion.language)}
                            className="flex items-center space-x-1"
                          >
                            <span>Start</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      onClick={() => startInterview('JavaScript')}
                      className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      JavaScript Interview
                    </Button>
                    <Button
                      onClick={() => startInterview('Python')}
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Python Interview
                    </Button>
                    <Button
                      onClick={() => startInterview('Data Structures & Algorithms')}
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      DSA Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}