# InterviewXP - Gemini AI-Powered Technical Interview Practice

A comprehensive technical interview practice application powered by Google's Gemini AI, featuring a modular architecture with dynamic question generation and adaptive difficulty adjustment.

## 🎯 Features

- **Modular Architecture**: Clean separation of concerns with independent, reusable modules
- **Dynamic Question Generation**: Gemini-powered adaptive questions based on trending topics
- **Intelligent Skill Assessment**: Automatic difficulty adjustment based on user performance
- **Multiple Programming Languages**: Java, Python, JavaScript, C++, TypeScript, Go, Rust, SQL
- **Consistent Question Formats**: MCQs, Code Analysis, Code Completion, DSA Challenges
- **Real-time Feedback**: Instant scoring and detailed explanations
- **User Profile Management**: Persistent skill tracking and interview history
- **Modern UI**: Beautiful, responsive interface with animations

## 🏗️ Modular Architecture

### Core Modules

#### 1. **Chat Module** (`lib/modules/chat/`)
- Manages conversation flow with Gemini AI
- Handles session state transitions (language selection → skill assessment → interviewing)
- Processes user responses and generates appropriate AI responses
- Integrates with other modules for comprehensive interview experience

#### 2. **Question Generation Engine** (`lib/modules/question-generation/`)
- Generates dynamic, contextual questions using Gemini AI
- Incorporates trending topics and modern programming practices
- Adapts difficulty based on user skill level and performance
- Maintains consistent question formats across all languages

#### 3. **User Profile Module** (`lib/modules/user-profile/`)
- Manages user preferences and interview history
- Tracks skill levels and performance metrics
- Provides persistent storage for user data
- Generates performance insights and recommendations

#### 4. **Feedback & Scoring Engine** (`lib/modules/feedback-scoring/`)
- Analyzes user responses using advanced AI techniques
- Provides detailed, constructive feedback
- Calculates performance metrics and trends
- Generates personalized improvement suggestions

#### 5. **Module Orchestrator** (`lib/modules/index.ts`)
- Coordinates interactions between all modules
- Manages application state and session lifecycle
- Provides unified API for component integration
- Handles module initialization and cleanup

## 🔄 Dynamic Interview Flow

### 1. **Language Selection Phase**
```
AI: "Which programming language would you like to use for this interview?"
User: "JavaScript"
AI: "Great choice! JavaScript is excellent for web development..."
```

### 2. **Skill Assessment Phase**
```
AI: "On a scale from 1 (beginner) to 5 (expert), how would you rate your proficiency in JavaScript?"
User: "3"
AI: "Perfect! I've noted you're at intermediate level. Let me start with appropriate questions..."
```

### 3. **Dynamic Interview Phase**
- Questions adapt based on:
  - Selected programming language
  - User's stated skill level (1-5)
  - Performance on previous questions
  - Current trending topics in the language
  - Time spent on responses

### 4. **Consistent Question Formats**
All questions follow these exact formats for UI parsing:

**🚀 MCQ Format:**
```
🚀 **[Language] Interview Question #[Number]**
[Question with context]
```javascript
[Code snippet if applicable]
```
**Choose the best answer:**
🅰️ A) [Option A]
🅱️ B) [Option B] 
🅲️ C) [Option C]
🅳️ D) [Option D]
💡 *Hint: [Helpful hint]*
```

**📝 Code Analysis Format:**
```
📝 **Code Analysis Challenge**
```javascript
[Code snippet to analyze]
```
**Question:** [Specific analysis question]
```

**🔧 Code Completion Format:**
```
🔧 **Complete the Code**
```javascript
[Partial code with TODO/placeholder]
```
**Requirements:** [Clear completion requirements]
```

**🧠 DSA Challenge Format:**
```
🧠 **Algorithm Challenge**
**Problem:** [Problem statement]
**Input:** [Input format]
**Output:** [Output format]  
**Example:** [Sample input/output]
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd interviewxp

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup
Create a `.env.local` file with your Gemini AI and service credentials:
```env
# === Gemini AI Key ===
GEMINI_API_KEY=your_gemini_api_key_here

# === Weaviate Vector DB ===
WEAVIATE_URL=your_weaviate_cluster_url
WEAVIATE_GRPC_URL=your_weaviate_grpc_url
WEAVIATE_API_KEY=your_weaviate_api_key

# === LangChain Related (optional for tracing) ===
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=InterviewXP

# === General App ===
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_COPILOT_PUBLIC_API_KEY=your_copilot_public_key
```

## 📁 Project Structure

```
project/
├── lib/modules/                   # Core modular architecture
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── user-profile/             # User management module
│   ├── question-generation/      # Dynamic question engine
│   ├── feedback-scoring/         # AI-powered feedback system
│   ├── chat/                     # Conversation management
│   └── index.ts                  # Module orchestrator
├── components/modules/            # Modular UI components
│   ├── ModularChatInterface.tsx  # Main chat interface
│   └── ModularInterviewStats.tsx # Performance dashboard
├── app/
│   ├── api/copilotkit/route.ts    # Gemini AI API endpoints
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application
├── components/
│   ├── CopilotSuggestions.tsx     # AI-powered suggestions
│   ├── LanguageSelector.tsx       # Language selection
│   └── ui/                        # UI components
├── hooks/
│   └── use-interview-state.ts     # Interview state management
└── lib/
    └── utils.ts                   # Utility functions
```

## 🔧 Module Integration

### Component Usage Example:
```typescript
import { moduleOrchestrator, chatModule } from '@/lib/modules';

// Initialize the system
await moduleOrchestrator.initialize();

// Start new interview session
const welcomeMessage = await moduleOrchestrator.startNewSession();

// Process user messages
const response = await chatModule.processMessage(userInput);
```

### Module Communication:
```typescript
// Modules communicate through the orchestrator
const sessionStatus = moduleOrchestrator.getSessionStatus();
// Returns: { hasProfile, language, skillLevel, sessionState, isActive }

// Each module maintains its own state but shares data through interfaces
const userStats = userProfileModule.getStats();
const questionContext = questionGenerationModule.getTrendingTopics(language);
```

## 🎨 UI Components

The application uses a modern, responsive design with:
- **Gradient backgrounds** and smooth animations
- **Card-based layouts** for clear information hierarchy
- **Interactive buttons** with hover effects
- **Real-time feedback** with scoring and progress tracking
- **Adaptive suggestions** based on performance

## 🤖 AI Integration

### Dynamic Prompt Generation
The system generates contextual prompts based on:
- User's selected programming language
- Current skill level assessment
- Previous question performance
- Trending topics in the technology space
- Session duration and engagement

### Adaptive Difficulty System
```typescript
// Questions automatically adjust based on performance
if (averageScore >= 8) {
  // Increase complexity and depth
  difficulty = 'Hard';
  includeAdvancedConcepts = true;
} else if (averageScore < 6) {
  // Provide more guidance and simpler concepts  
  difficulty = 'Easy';
  includeHints = true;
}
```

## 🔧 Configuration

### Language Support
Currently supports:
- JavaScript (ES6+, async programming)
- Python (Pythonic code, decorators)
- Java (OOP, collections framework)
- C++ (memory management, STL)
- TypeScript (type system, generics)
- Go (goroutines, channels)
- Rust (ownership, lifetimes)
- SQL (joins, optimization)

### Trending Topics Integration
Each language maintains a curated list of trending topics that influence question generation:
- **JavaScript**: React Server Components, Next.js 14, TypeScript 5.0, Vite, WebAssembly
- **Python**: FastAPI, Pydantic v2, AsyncIO, Type Hints, LangChain, MLOps
- **Java**: Spring Boot 3, Virtual Threads, GraalVM, Project Loom, Java 21 LTS
- **And more...**

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- AI integration via [CopilotKit](https://copilotkit.ai/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Vector database by [Weaviate](https://weaviate.io/)
- AI orchestration with [LangChain](https://langchain.com/)