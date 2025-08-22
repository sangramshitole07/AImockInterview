🚀 InterviewXP: AI-Powered Technical Interview Simulator
InterviewXP is an advanced, interactive web application designed to help users master their technical interviews. Leveraging Google's Gemini Pro LLM and CopilotKit, it provides a dynamic interview experience with a dedicated AI Interviewer and a supportive AI Assistant.

✨ Features
Adaptive Interviewer: An AI interviewer that asks dynamic, contextually relevant questions based on your chosen subject and adapts difficulty based on your self-rated proficiency and performance.

Comprehensive Subjects: Practice across a wide range of topics including:

JavaScript, Python, Java, C++, Go, TypeScript, Rust, SQL

React, Next.js, Node.js

Data Science, ML, NLP

App Development, DSA, OOP

CN, DBMS, SE, OS

Multiple Question Formats: Engages users with various question types:

🚀 MCQ (Multiple Choice Questions)

📝 Code Snippet Analysis

🔧 Code Completion

🧠 DSA Challenges

Real-time Feedback: Provides structured feedback and a score out of 10 after each answer, highlighting strengths and areas for improvement.

Intelligent AI Assistant: A separate popup assistant offers contextual hints, concept explanations, and real-life examples without giving away direct answers.

Seamless Chat UI: Utilizes CopilotKit's chat components for a smooth, Gemini Pro-like conversational interface with proper Markdown rendering for code snippets and feedback.

Performance Tracking: Monitors interview progress, average scores, and recent performance.

Responsive Design: Optimized for a great user experience across all devices.

🛠️ Tech Stack
Framework: Next.js (App Router)

AI Integration: CopilotKit (@copilotkit/react-ui, @copilotkit/react-core, @copilotkit/backend, @copilotkit/google-generative-ai-adapter)

Large Language Model: Google Gemini (gemini-2.0-flash)

Styling: Tailwind CSS

Animations: Framer Motion

State Management: React Hooks (useState, useEffect, useCallback, useRef) and a custom useInterviewState hook.

Icons: Lucide React

🚀 Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v18.x or higher)

npm (v8.x or higher)

A Google Gemini API Key (obtainable from Google AI Studio)

Installation
Clone the repository:

git clone [your-repo-url]
cd InterviewXP

Install dependencies:

npm install

Environment Variables
Create a .env.local file in the root of your project and add your API keys:


.env.local

=== Google Gemini AI Key ===
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

=== CopilotKit Public API Key (if using CopilotKit's hosted services, otherwise runtimeUrl is used) ===
NEXT_PUBLIC_COPILOT_PUBLIC_API_KEY="YOUR_COPILOTKIT_PUBLIC_API_KEY"

=== Weaviate Vector DB (Optional, if integrating for advanced context) ===
WEAVIATE_URL="YOUR_WEAVIATE_URL"
WEAVIATE_GRPC_URL="YOUR_WEAVIATE_GRPC_URL"
WEAVIATE_API_KEY="YOUR_WEAVIATE_API_KEY"

=== LangChain Related (optional for tracing) ===
LANGCHAIN_API_KEY="YOUR_LANGCHAIN_API_KEY"
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=InterviewXP

Important: Replace "YOUR_GOOGLE_GEMINI_API_KEY" with your actual API key.

Running the Application
Start the development server:

npm run dev

Open your browser and navigate to http://localhost:3000.

💡 Usage
The application features two main AI interfaces:

AI Interviewer (Main Chat):

Located in the central part of the screen.

Start: Select a language/subject from the homepage. The interviewer will then ask for your proficiency rating (1-10).

Interaction: Type your answers in the input box. The AI will provide feedback and the next question.

Dynamic Questions: Questions are generated on-the-fly, adapting to your performance and selected topic.

AI Assistant (Floating Popup):

Click the "Get Help" button to open the floating popup.

Contextual Help: Ask the assistant for hints, concept explanations, or code examples related to the current interview question.

Guidance: The assistant will guide you towards the answer without directly providing it.



🧠 AI Prompts (Core AI Logic)
The intelligence of the application is driven by detailed prompts injected into the Gemini LLM. These prompts define the persona, rules, output formats, and contextual awareness for both the Interviewer and the Assistant. They are critical for ensuring the AI behaves as expected. The prompts are centrally defined in lib/prompts.ts.

INTERVIEWER_PROMPT: Guides the main chat to conduct structured interviews, adapt difficulty, provide detailed feedback, and generate relevant questions.

ASSISTANT_PROMPT: Guides the popup assistant to offer contextual hints, explanations, and examples without giving direct answers.

🐛 Troubleshooting
ReferenceError: window is not defined: Ensure browser-specific code (like window access) is inside useEffect hooks.

Module not found: Can't resolve 'encoding': Add webpack fallback for encoding: false in next.config.js.

Error: Invariant: headers() expects to have requestAsyncStorage, none available.: Remove output: 'export' from next.config.js and ensure export const dynamic = 'force-dynamic'; in API routes.

Error: Element type is invalid... or Missing required prop: 'runtimeUrl': Confirm <CopilotKit runtimeUrl="/api/copilotkit"> is the single top-level wrapper, and no nested CopilotKit instances exist.

GraphQLError: An unexpected error occurred:

Verify GEMINI_API_KEY: Check .env.local for correctness. Restart server.

Test Gemini API Directly: Use a standalone script to confirm your API key and model (gemini-2.0-flash) are functional.

Check Server Logs: Look for more detailed error messages from the Gemini API in your terminal where npm run dev is running.

Jittery Scrolling in CopilotChat: Ensure the parent Card has a fixed height (e.g., h-[70vh]) and the direct wrapper of CopilotChat has flex-1 overflow-auto.

🤝 Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

📄 License
This project is open-source and available under the MIT License.

🙏 Acknowledgements
CopilotKit for the AI UI framework.

Google Gemini API for the powerful LLM.

Next.js for the React framework.

Tailwind CSS for utility-first styling.

Lucide React for beautiful icons.
