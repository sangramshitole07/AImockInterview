// Chat Module - Manages conversation flow with Gemini

import { ChatMessage, InterviewQuestion, UserProfile } from '../types';
import { questionGenerationModule } from '../question-generation';
import { feedbackScoringModule } from '../feedback-scoring';
import { userProfileModule } from '../user-profile';

export class ChatModule {
  private static instance: ChatModule;
  private messages: ChatMessage[] = [];
  private currentQuestion: InterviewQuestion | null = null;
  private sessionState: 'language_selection' | 'skill_assessment' | 'interviewing' | 'completed' = 'language_selection';

  private constructor() {}

  static getInstance(): ChatModule {
    if (!ChatModule.instance) {
      ChatModule.instance = new ChatModule();
    }
    return ChatModule.instance;
  }

  // Initialize chat session
  initializeSession(): ChatMessage {
    this.messages = [];
    this.sessionState = 'language_selection';
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: questionGenerationModule.generateLanguageSelectionPrompt(),
      timestamp: new Date(),
      metadata: { type: 'language_selection' }
    };

    this.messages.push(welcomeMessage);
    return welcomeMessage;
  }

  // Process user message and generate appropriate response
  async processMessage(userMessage: string): Promise<ChatMessage> {
    // Add user message to history
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    this.messages.push(userChatMessage);

    // Generate response based on current state
    let responseContent = '';
    let metadata: any = {};

    switch (this.sessionState) {
      case 'language_selection':
        responseContent = await this.handleLanguageSelection(userMessage);
        break;
      
      case 'skill_assessment':
        responseContent = await this.handleSkillAssessment(userMessage);
        break;
      
      case 'interviewing':
        responseContent = await this.handleInterviewResponse(userMessage);
        break;
      
      default:
        responseContent = "I'm not sure how to proceed. Let's restart the interview.";
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      metadata,
    };

    this.messages.push(assistantMessage);
    return assistantMessage;
  }

  // Handle language selection
  private async handleLanguageSelection(userMessage: string): Promise<string> {
    const languages = [
      'javascript', 'python', 'java', 'c++', 'typescript', 'go', 'rust', 'sql',
      'react', 'next.js', 'node.js', 'data science', 'machine learning', 'nlp', 
      'app development', 'data structures & algorithms', 'object-oriented programming',
      'computer networks', 'database management', 'software engineering', 'operating systems'
    ];
    
    const selectedLanguage = languages.find(lang => 
      userMessage.toLowerCase().includes(lang.toLowerCase()) || 
      userMessage.toLowerCase().includes(lang.toLowerCase().replace('++', 'plus')) ||
      userMessage.toLowerCase().includes(lang.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    if (selectedLanguage) {
      const languageName = selectedLanguage === 'c++' ? 'C++' :
                          selectedLanguage === 'next.js' ? 'Next.js' :
                          selectedLanguage === 'node.js' ? 'Node.js' :
                          selectedLanguage === 'nlp' ? 'NLP' :
                          selectedLanguage.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
      
      userProfileModule.setLanguage(languageName);
      this.sessionState = 'skill_assessment';
      
      return questionGenerationModule.generateSkillAssessmentPrompt(languageName);
    } else {
      return `I didn't catch which topic you'd like to use. Please choose from the available options including:

**Programming Languages:** JavaScript, Python, Java, C++, TypeScript, Go, Rust, SQL
**Frameworks:** React, Next.js, Node.js
**Domains:** Data Science, Machine Learning, NLP, App Development
**Fundamentals:** Data Structures & Algorithms, OOP, Computer Networks, Database Management, Software Engineering, Operating Systems

Just mention the topic you're interested in!`;
    }
  }

  // Handle skill level assessment
  private async handleSkillAssessment(userMessage: string): Promise<string> {
    const skillMatch = userMessage.match(/[1-5]/);
    if (skillMatch) {
      const skillLevel = parseInt(skillMatch[0]) as 1 | 2 | 3 | 4 | 5;
      userProfileModule.setSkillLevel(skillLevel);
      this.sessionState = 'interviewing';

      const profile = userProfileModule.getProfile();
      if (profile) {
        return `Perfect! I've noted that you're at skill level ${skillLevel}/5 in ${profile.selectedLanguage}.

Let me start with your first technical question. I'll adjust the difficulty based on your responses and provide detailed feedback after each answer.

${await this.generateNextQuestion()}`;
      }
    }

    return `Please provide your skill level as a number from 1 to 5:
- 1: Beginner
- 2: Novice  
- 3: Intermediate
- 4: Advanced
- 5: Expert`;
  }

  // Handle interview responses
  private async handleInterviewResponse(userMessage: string): Promise<string> {
    if (!this.currentQuestion) {
      return await this.generateNextQuestion();
    }

    // Score the current response
    const profile = userProfileModule.getProfile();
    if (!profile) return "Error: No user profile found.";

    const feedbackPrompt = feedbackScoringModule.generateFeedbackPrompt(
      this.currentQuestion,
      userMessage,
      profile.selectedLanguage!,
      profile.skillLevel
    );

    // In a real implementation, this would call Gemini API
    // For now, we'll simulate the response
    const feedbackResult = this.simulateFeedbackResponse(userMessage);

    // Update question with score and feedback
    this.currentQuestion.userAnswer = userMessage;
    this.currentQuestion.score = feedbackResult.score;
    this.currentQuestion.feedback = feedbackResult.feedback;

    // Generate response with feedback and next question
    let response = `Thank you for your answer!\n\n`;
    response += `**Score: ${feedbackResult.score}/10**\n\n`;
    response += `**Feedback:**\n${feedbackResult.feedback}\n\n`;
    
    if (feedbackResult.strengths.length > 0) {
      response += `**Strengths:**\n${feedbackResult.strengths.map(s => `• ${s}`).join('\n')}\n\n`;
    }
    
    if (feedbackResult.improvements.length > 0) {
      response += `**Areas for Improvement:**\n${feedbackResult.improvements.map(i => `• ${i}`).join('\n')}\n\n`;
    }

    // Generate next question
    response += `**Next Question:**\n${await this.generateNextQuestion()}`;

    return response;
  }

  // Generate next question based on context
  private async generateNextQuestion(): Promise<string> {
    const profile = userProfileModule.getProfile();
    if (!profile) return "Error: No user profile found.";

    // Get previous questions from messages (ensure id is a string)
    const previousQuestions: InterviewQuestion[] = this.messages
      .filter(
        (m): m is ChatMessage & { metadata: { questionId: string } } =>
          typeof m.metadata?.questionId === 'string'
      )
      .map((m) => ({
        id: m.metadata.questionId,
        type: 'MCQ',
        difficulty: 'Medium',
        category: 'General',
        question: m.content,
        timestamp: m.timestamp,
      }));

    const context = {
      language: profile.selectedLanguage!,
      skillLevel: profile.skillLevel,
      previousQuestions,
      currentPerformance: {
        averageScore: 7.5, // This would be calculated from actual responses
        strengths: [],
        weaknesses: [],
      },
      sessionDuration: 0,
    };

    const questionPrompt = questionGenerationModule.generateQuestionPrompt(context);
    
    // In a real implementation, this would call Gemini API
    // For now, we'll return a sample question
    const sampleQuestion = this.generateSampleQuestion(profile.selectedLanguage!, profile.skillLevel);
    
    this.currentQuestion = {
      id: Date.now().toString(),
      type: 'MCQ',
      difficulty: profile.skillLevel <= 2 ? 'Easy' : profile.skillLevel <= 4 ? 'Medium' : 'Hard',
      category: 'Technical',
      question: sampleQuestion,
      timestamp: new Date(),
    };

    return sampleQuestion;
  }

  // Simulate feedback response (replace with actual Gemini API call)
  private simulateFeedbackResponse(userAnswer: string) {
    const score = Math.floor(Math.random() * 4) + 7; // 7-10 for demo
    return {
      score,
      feedback: score >= 8 
        ? "Excellent understanding! Your explanation was clear and comprehensive."
        : "Good answer with room for improvement in some areas.",
      strengths: ["Clear explanation", "Good understanding of concepts"],
      improvements: score < 8 ? ["Consider edge cases", "Provide more examples"] : [],
    };
  }

  // Generate sample question (replace with actual Gemini generation)
  private generateSampleQuestion(language: string, skillLevel: number): string {
    const questions = {
      JavaScript: {
        1: `🚀 **JavaScript Interview Question #1**

What is the difference between \`let\`, \`const\`, and \`var\` in JavaScript?

**Choose the best answer:**
🅰️ A) They are all the same, just different syntax
🅱️ B) \`let\` and \`const\` have block scope, \`var\` has function scope
🅲️ C) \`const\` cannot be reassigned, \`let\` and \`var\` can be
🅳️ D) Both B and C are correct

💡 *Hint: Think about scope and mutability*`,
        
        3: `📝 **Code Analysis Challenge**

\`\`\`javascript
const arr = [1, 2, 3, 4, 5];
const result = arr.map(x => x * 2).filter(x => x > 5);
console.log(result);
\`\`\`

**Question:** What will be the output and explain the execution flow?`,
        
        5: `🧠 **Algorithm Challenge**

**Problem:** Implement a debounce function that delays the execution of a function until after a specified delay has elapsed since its last invocation.

**Requirements:** 
- Should work with any function
- Should handle arguments correctly
- Should be cancellable

**Example Usage:**
\`\`\`javascript
const debouncedFn = debounce(() => console.log('Called!'), 300);
debouncedFn(); // Will execute after 300ms if not called again
\`\`\``
      }
    };

    const langQuestions = questions[language as keyof typeof questions];
    if (langQuestions) {
      const levelKey = skillLevel <= 2 ? 1 : skillLevel <= 4 ? 3 : 5;
      return langQuestions[levelKey as keyof typeof langQuestions] || langQuestions[1];
    }

    return `🚀 **${language} Interview Question**\n\nExplain the key features and use cases of ${language}.`;
  }

  // Get all messages
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  // Clear chat history
  clearChat(): void {
    this.messages = [];
    this.currentQuestion = null;
    this.sessionState = 'language_selection';
  }

  // Get current session state
  getSessionState() {
    return this.sessionState;
  }
}

export const chatModule = ChatModule.getInstance();