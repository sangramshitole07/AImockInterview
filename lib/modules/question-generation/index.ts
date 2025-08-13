// Question Generation Engine - Generates dynamic questions using Gemini

import { InterviewQuestion, QuestionGenerationContext } from '../types';

export class QuestionGenerationModule {
  private static instance: QuestionGenerationModule;
  private trendingTopics: Map<string, string[]> = new Map();

  private constructor() {
    this.initializeTrendingTopics();
  }

  static getInstance(): QuestionGenerationModule {
    if (!QuestionGenerationModule.instance) {
      QuestionGenerationModule.instance = new QuestionGenerationModule();
    }
    return QuestionGenerationModule.instance;
  }

  // Initialize trending topics for each language
  private initializeTrendingTopics(): void {
    this.trendingTopics.set('JavaScript', [
      'React Server Components', 'Next.js 14', 'TypeScript 5.0', 'Vite', 'Web Components',
      'WebAssembly', 'Edge Computing', 'Micro-frontends', 'GraphQL', 'Deno 2.0'
    ]);
    
    this.trendingTopics.set('Python', [
      'FastAPI', 'Pydantic v2', 'AsyncIO', 'Type Hints', 'Poetry',
      'Polars', 'Streamlit', 'LangChain', 'MLOps', 'Python 3.12'
    ]);
    
    this.trendingTopics.set('Java', [
      'Spring Boot 3', 'Virtual Threads', 'GraalVM', 'Project Loom', 'Reactive Streams',
      'Microservices', 'Kubernetes', 'JUnit 5', 'Maven vs Gradle', 'Java 21 LTS'
    ]);
    
    this.trendingTopics.set('TypeScript', [
      'Strict Mode', 'Template Literal Types', 'Conditional Types', 'Utility Types',
      'Declaration Merging', 'Module Resolution', 'TSConfig', 'Type Guards', 'Generics'
    ]);
    
    // Frameworks & Technologies
    this.trendingTopics.set('React', [
      'React 18', 'Concurrent Features', 'Suspense', 'Server Components', 'Hooks',
      'Context API', 'State Management', 'Performance Optimization', 'Testing', 'Next.js Integration'
    ]);
    
    this.trendingTopics.set('Next.js', [
      'App Router', 'Server Actions', 'Streaming', 'Edge Runtime', 'Middleware',
      'API Routes', 'Static Generation', 'Dynamic Routing', 'Image Optimization', 'Deployment'
    ]);
    
    this.trendingTopics.set('Node.js', [
      'Express.js', 'Fastify', 'Event Loop', 'Streams', 'Clustering',
      'Worker Threads', 'Performance Monitoring', 'Security', 'Testing', 'Deployment'
    ]);
    
    // Specialized Domains
    this.trendingTopics.set('Data Science', [
      'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn',
      'Statistical Analysis', 'Data Visualization', 'Feature Engineering', 'A/B Testing', 'Big Data'
    ]);
    
    this.trendingTopics.set('Machine Learning', [
      'Supervised Learning', 'Unsupervised Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow',
      'PyTorch', 'Model Evaluation', 'Feature Selection', 'Hyperparameter Tuning', 'MLOps'
    ]);
    
    this.trendingTopics.set('NLP', [
      'Transformers', 'BERT', 'GPT', 'Text Preprocessing', 'Tokenization',
      'Named Entity Recognition', 'Sentiment Analysis', 'Language Models', 'Embeddings', 'NLTK'
    ]);
    
    this.trendingTopics.set('App Development', [
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'Cross-platform',
      'Native Development', 'State Management', 'Navigation', 'Performance', 'App Store'
    ]);
    
    // Computer Science Fundamentals
    this.trendingTopics.set('Data Structures & Algorithms', [
      'Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables',
      'Sorting Algorithms', 'Search Algorithms', 'Dynamic Programming', 'Greedy Algorithms', 'Complexity Analysis'
    ]);
    
    this.trendingTopics.set('Object-Oriented Programming', [
      'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Design Patterns',
      'SOLID Principles', 'Composition vs Inheritance', 'Interface Design', 'Code Reusability', 'Best Practices'
    ]);
    
    this.trendingTopics.set('Computer Networks', [
      'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Load Balancing', 'CDN',
      'Network Security', 'Protocols', 'OSI Model', 'Routing', 'Network Troubleshooting'
    ]);
    
    this.trendingTopics.set('Database Management', [
      'SQL Queries', 'Database Design', 'Normalization', 'Indexing', 'Transactions',
      'ACID Properties', 'NoSQL', 'Database Performance', 'Backup & Recovery', 'Data Modeling'
    ]);
    
    this.trendingTopics.set('Software Engineering', [
      'SDLC', 'Agile Methodology', 'Version Control', 'Testing Strategies', 'Code Review',
      'CI/CD', 'Documentation', 'Requirements Analysis', 'System Design', 'Project Management'
    ]);
    
    this.trendingTopics.set('Operating Systems', [
      'Process Management', 'Memory Management', 'File Systems', 'Concurrency', 'Synchronization',
      'Deadlocks', 'Scheduling Algorithms', 'Virtual Memory', 'System Calls', 'Security'
    ]);
  }

  // Generate question prompt for Gemini
  generateQuestionPrompt(context: QuestionGenerationContext): string {
    const { language, skillLevel, previousQuestions, currentPerformance } = context;
    const trending = this.trendingTopics.get(language) || [];
    
    const skillLevelMap = {
      1: 'Beginner (Basic syntax and concepts)',
      2: 'Novice (Simple problem solving)',
      3: 'Intermediate (Complex algorithms and patterns)',
      4: 'Advanced (System design and optimization)',
      5: 'Expert (Architecture and best practices)'
    };

    const questionTypes = [
      '🚀 **MCQ Format**',
      '📝 **Code Analysis Format**', 
      '🔧 **Code Completion Format**',
      '🧠 **DSA Challenge Format**'
    ];

    return `You are an expert ${language} technical interviewer conducting a dynamic, adaptive interview. 

**CONTEXT:**
- Language: ${language}
- Skill Level: ${skillLevel}/5 (${skillLevelMap[skillLevel as keyof typeof skillLevelMap]})
- Questions Asked: ${previousQuestions.length}
- Current Performance: ${currentPerformance.averageScore.toFixed(1)}/10
- Trending Topics: ${trending.slice(0, 5).join(', ')}

**INSTRUCTIONS:**
1. Generate ONE question that is:
   - Appropriate for skill level ${skillLevel}/5
   - Different from previous ${previousQuestions.length} questions
   - Incorporates modern ${language} practices or trending topics when relevant
   - Follows the EXACT format specified below

2. **MANDATORY QUESTION FORMATS** (choose ONE):

**🚀 MCQ Format:**
🚀 **${language} Interview Question #${previousQuestions.length + 1}**

[Clear, concise question with relevant context]

\`\`\`${language.toLowerCase()}
[Complete, correct code snippet if needed]
\`\`\`

**Choose the best answer:**
🅰️ A) [Realistic option]
🅱️ B) [Realistic option] 
🅲️ C) [Realistic option]
🅳️ D) [Realistic option]

💡 *Hint: [Helpful hint without giving away answer]*

**📝 Code Analysis Format:**
📝 **Code Analysis Challenge**

\`\`\`${language.toLowerCase()}
[Complete, runnable code snippet with potential issues]
\`\`\`

**Question:** [Specific question about the code - output, bugs, optimization, complexity]

**🔧 Code Completion Format:**
🔧 **Complete the Code**

\`\`\`${language.toLowerCase()}
[Partial code with clear TODO or placeholder]
\`\`\`

**Requirements:** [Clear requirements for completion]

**🧠 DSA Challenge Format:**
🧠 **Algorithm Challenge**

**Problem:** [Clear problem statement]
**Input:** [Input format and constraints]
**Output:** [Expected output format]
**Example:** [Sample input/output]

**DIFFICULTY ADJUSTMENT:**
${skillLevel <= 2 ? '- Focus on fundamentals and basic syntax' : ''}
${skillLevel === 3 ? '- Include intermediate concepts and problem-solving' : ''}
${skillLevel >= 4 ? '- Emphasize advanced patterns, optimization, and best practices' : ''}

**PERFORMANCE ADAPTATION:**
${currentPerformance.averageScore < 6 ? '- Provide more guidance and simpler concepts' : ''}
${currentPerformance.averageScore >= 8 ? '- Increase complexity and depth' : ''}

Generate exactly ONE question following the specified format.`;
  }

  // Get trending topics for a language
  getTrendingTopics(language: string): string[] {
    return this.trendingTopics.get(language) || [];
  }

  // Update trending topics (could be called periodically)
  updateTrendingTopics(language: string, topics: string[]): void {
    this.trendingTopics.set(language, topics);
  }

  // Generate skill assessment prompt
  generateSkillAssessmentPrompt(language: string): string {
    return `You are conducting a ${language} technical interview. Start by asking the user to select their skill level.

Please ask: "On a scale from 1 (beginner) to 5 (expert), how would you rate your proficiency in ${language}?"

**Skill Level Guide:**
- **1 (Beginner)**: Just starting, learning basic syntax
- **2 (Novice)**: Can write simple programs, understand basic concepts  
- **3 (Intermediate)**: Comfortable with language features, can solve moderate problems
- **4 (Advanced)**: Deep understanding, can handle complex scenarios and optimization
- **5 (Expert)**: Mastery level, understands internals and advanced patterns

Once they respond with their skill level, acknowledge it and prepare to ask your first technical question appropriate for their level.`;
  }

  // Generate language selection prompt
  generateLanguageSelectionPrompt(): string {
    return `Welcome to your technical interview! I'm your AI interviewer powered by Google Gemini, and I'll be conducting a comprehensive assessment across various technical domains.

Which topic would you like to focus on for this interview?

**Programming Languages:**
- **JavaScript** - Web development & Node.js
- **Python** - Data science & Backend development  
- **Java** - Enterprise & Android development
- **C++** - Systems & Performance programming
- **TypeScript** - Type-safe JavaScript development
- **Go** - Cloud & Microservices
- **Rust** - Memory safety & Performance
- **SQL** - Database & Data analysis

**Frameworks & Technologies:**
- **React** - Frontend library & ecosystem
- **Next.js** - Full-stack React framework
- **Node.js** - Backend JavaScript runtime

**Specialized Domains:**
- **Data Science** - Analytics & Statistical modeling
- **Machine Learning** - AI & ML algorithms
- **NLP** - Natural Language Processing
- **App Development** - Mobile & Cross-platform

**Computer Science Fundamentals:**
- **Data Structures & Algorithms** - DSA concepts & problem solving
- **Object-Oriented Programming** - OOP principles & design patterns
- **Computer Networks** - Networking protocols & concepts
- **Database Management** - DBMS concepts & design
- **Software Engineering** - SDLC & best practices
- **Operating Systems** - OS concepts & system programming

Please select your preferred topic, and I'll tailor the interview accordingly with questions specific to that domain.`;
  }
}

export const questionGenerationModule = QuestionGenerationModule.getInstance();