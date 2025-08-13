// Feedback and Scoring Engine - Analyzes responses and provides detailed feedback

import { FeedbackResult, InterviewQuestion } from '../types';

export class FeedbackScoringModule {
  private static instance: FeedbackScoringModule;

  private constructor() {}

  static getInstance(): FeedbackScoringModule {
    if (!FeedbackScoringModule.instance) {
      FeedbackScoringModule.instance = new FeedbackScoringModule();
    }
    return FeedbackScoringModule.instance;
  }

  // Generate feedback prompt for Gemini
  generateFeedbackPrompt(
    question: InterviewQuestion,
    userAnswer: string,
    language: string,
    skillLevel: number
  ): string {
    return `You are an expert ${language} technical interviewer. Analyze this interview response and provide detailed feedback.

**QUESTION:**
${question.question}
${question.codeSnippet ? `\n\`\`\`${language.toLowerCase()}\n${question.codeSnippet}\n\`\`\`` : ''}

**USER'S ANSWER:**
${userAnswer}

**CONTEXT:**
- Language: ${language}
- Question Type: ${question.type}
- Difficulty: ${question.difficulty}
- User Skill Level: ${skillLevel}/5

**PROVIDE STRUCTURED FEEDBACK:**

**Score: [X]/10**

**Overall Assessment:**
[2-3 sentences summarizing the response quality]

**Strengths:**
- [Specific positive aspects of the answer]
- [Technical accuracy points]
- [Good practices demonstrated]

**Areas for Improvement:**
- [Specific areas that need work]
- [Missing concepts or details]
- [Better approaches or optimizations]

**Detailed Analysis:**
[Deeper technical analysis of the response, including:]
- Correctness of the solution/explanation
- Code quality and best practices (if applicable)
- Understanding of underlying concepts
- Consideration of edge cases
- Performance implications

**Next Steps:**
[Suggestions for what to study or practice next]

**Scoring Criteria:**
- 9-10: Exceptional understanding, comprehensive answer
- 7-8: Good understanding with minor gaps
- 5-6: Basic understanding, needs improvement
- 3-4: Limited understanding, significant gaps
- 1-2: Minimal understanding, requires fundamental review

Be constructive, specific, and encouraging while maintaining technical accuracy.`;
  }

  // Parse feedback response from Gemini
  parseFeedbackResponse(response: string): FeedbackResult {
    const scoreMatch = response.match(/Score:\s*(\d+)\/10/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    // Extract sections using regex
    const strengthsMatch = response.match(/\*\*Strengths:\*\*(.*?)(?=\*\*|$)/s);
    const improvementsMatch = response.match(/\*\*Areas for Improvement:\*\*(.*?)(?=\*\*|$)/s);
    const assessmentMatch = response.match(/\*\*Overall Assessment:\*\*(.*?)(?=\*\*|$)/s);

    const strengths = strengthsMatch 
      ? strengthsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
      : [];

    const improvements = improvementsMatch
      ? improvementsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
      : [];

    const feedback = assessmentMatch ? assessmentMatch[1].trim() : response;

    return {
      score,
      feedback,
      strengths,
      improvements,
    };
  }

  // Calculate session performance metrics
  calculateSessionMetrics(questions: InterviewQuestion[]) {
    const completedQuestions = questions.filter(q => q.score !== undefined);
    
    if (completedQuestions.length === 0) {
      return {
        averageScore: 0,
        totalQuestions: 0,
        completedQuestions: 0,
        scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        strengths: [],
        weaknesses: [],
        timeMetrics: { averageTime: 0, totalTime: 0 }
      };
    }

    const scores = completedQuestions.map(q => q.score!);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const scoreDistribution = {
      excellent: scores.filter(s => s >= 9).length,
      good: scores.filter(s => s >= 7 && s < 9).length,
      fair: scores.filter(s => s >= 5 && s < 7).length,
      poor: scores.filter(s => s < 5).length,
    };

    // Analyze question types performance
    const typePerformance = completedQuestions.reduce((acc, q) => {
      if (!acc[q.type]) acc[q.type] = [];
      acc[q.type].push(q.score!);
      return acc;
    }, {} as Record<string, number[]>);

    const strengths = Object.entries(typePerformance)
      .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length >= 7)
      .map(([type, _]) => type);

    const weaknesses = Object.entries(typePerformance)
      .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length < 6)
      .map(([type, _]) => type);

    // Time metrics
    const timesSpent = completedQuestions.filter(q => q.timeSpent).map(q => q.timeSpent!);
    const averageTime = timesSpent.length > 0 ? timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length : 0;
    const totalTime = timesSpent.reduce((sum, time) => sum + time, 0);

    return {
      averageScore,
      totalQuestions: questions.length,
      completedQuestions: completedQuestions.length,
      scoreDistribution,
      strengths,
      weaknesses,
      timeMetrics: { averageTime, totalTime }
    };
  }

  // Generate performance insights
  generatePerformanceInsights(metrics: ReturnType<typeof this.calculateSessionMetrics>, language: string): string {
    const { averageScore, scoreDistribution, strengths, weaknesses } = metrics;
    
    let insights = `## Performance Analysis for ${language}\n\n`;
    
    // Overall performance
    if (averageScore >= 8) {
      insights += "🎉 **Excellent Performance!** You're demonstrating strong mastery of the concepts.\n\n";
    } else if (averageScore >= 6) {
      insights += "👍 **Good Performance!** You have a solid foundation with room for growth.\n\n";
    } else {
      insights += "📚 **Keep Learning!** Focus on strengthening your fundamentals.\n\n";
    }

    // Score distribution
    insights += "### Score Distribution:\n";
    insights += `- Excellent (9-10): ${scoreDistribution.excellent} questions\n`;
    insights += `- Good (7-8): ${scoreDistribution.good} questions\n`;
    insights += `- Fair (5-6): ${scoreDistribution.fair} questions\n`;
    insights += `- Needs Work (<5): ${scoreDistribution.poor} questions\n\n`;

    // Strengths and weaknesses
    if (strengths.length > 0) {
      insights += `### Your Strengths:\n${strengths.map(s => `- ${s}`).join('\n')}\n\n`;
    }
    
    if (weaknesses.length > 0) {
      insights += `### Areas to Focus On:\n${weaknesses.map(w => `- ${w}`).join('\n')}\n\n`;
    }

    return insights;
  }
}

export const feedbackScoringModule = FeedbackScoringModule.getInstance();