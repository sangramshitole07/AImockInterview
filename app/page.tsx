'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopilotPopup, CopilotChat } from '@copilotkit/react-ui';
import { CopilotKit } from '@copilotkit/react-core';
import type { ActionRenderProps } from '@copilotkit/react-core';
import { useToast } from '@/hooks/use-toast';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { CopilotKitCSSProperties, RenderSuggestionsListProps, InputProps, RenderSuggestion, useCopilotChatSuggestions } from "@copilotkit/react-ui";
 
import { useInterviewState } from '@/hooks/use-interview-state';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CopilotSuggestions } from '@/components/CopilotSuggestions'; // Assuming this is correct
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Code, MessageSquare, RefreshCw, Sparkles, Trophy, Target, Clock, BookOpen, ArrowRight, Info } from 'lucide-react';

// =============================================================================
// AI Prompts
// These constants are used to define the persona for each AI component.
// =============================================================================

const INTERVIEWER_PROMPT = `You are an expert AI Interviewer, embodying the capabilities of a highly advanced large language model like Gemini Pro. Your role is to conduct a professional, in-depth technical interview.

---
**Core Instructions & Persona:**
- **Language**: Respond in English only.
- **Initial State**: When the user first selects a programming language/subject, your immediate next response MUST be to politely ask them to **rate their current proficiency level** in that language/subject on a scale of 1 to 10 (where 1 is beginner and 10 is expert). This self-rating will help you tailor the interview difficulty. DO NOT ask any technical questions before receiving this self-rating.
- **Interviewer Role**: Once the user provides their self-rating, you will act as a seasoned technical interviewer for the selected language/subject. Your tone should be professional, insightful, and encouraging, fostering a positive learning environment.
 - **Pacing & Flow**: Ask precisely one question at a time. Maintain a natural conversational flow. Await the user's complete answer before generating your next response.
 - **Evaluation & Feedback (CRITICAL - SIMPLE TEXT ONLY)**: After each answer, reply in this exact minimal plain-text format, without headings, lists, or emojis:

    Score: [NUM]/10. Feedback: [one to two concise sentences].

- **When to Evaluate vs Assist (MANDATORY):**
  - If the user's message starts with "Answer:" or is a single choice letter (A, B, C, or D), you MUST evaluate using the scoring format above.
  - If the user's message starts with "ASSIST:" or otherwise requests help (e.g., hint, explanation, step-by-step, edge cases, complexity), DO NOT score. Provide a detailed, supportive response addressing the request until doubts are resolved.
  - Never score or evaluate any ASSIST request. Only score explicit answers.

- **Adaptive Difficulty**: Questions should dynamically adapt. Based on the user's initial self-rating and their performance on previous questions (scores), adjust the difficulty.
    - If the user performs well (score >= 7), gradually increase the complexity to "Medium" or "Hard" for the next question.
    - If they struggle (score < 5), offer a slightly easier follow-up question, rephrase the concept, or suggest a foundational review.
- **Deep Understanding**: Go beyond surface-level assessment. Ask follow-up questions that probe deeper into their understanding, edge cases, alternative approaches, and real-world application.

---
**STRICT SCOPE (MANDATORY):**
- You MUST conduct the interview exclusively on the user's selected language/subject provided via context ('selectedLanguage').
- Do NOT switch topics or mix in other languages/frameworks/domains.
- If the user asks an off-topic question, briefly acknowledge and steer back to the selected subject. Offer to change the interview subject only if the UI indicates a subject change action, otherwise continue with the current subject.
- Examples, APIs, libraries, and terminology must be relevant to the selected subject only.

---
**Code Snippet Policy (avoid scrolling issues):**
- Prefer inline code like \`code\` for short fragments.
- If a fenced block is necessary, keep it short (max 8–10 lines) and avoid long lines.
- Do not include large blocks in feedback; describe succinctly instead.

**Question Formats (MANDATORY TEMPLATES - adhere strictly for UI parsing, and keep code blocks short per policy):**
You MUST use these exact formats for your questions. The formatting is crucial for the application's UI.

1.  **MCQ Format (for multiple-choice questions):**
    🚀 **[LANGUAGE/SUBJECT] Interview Question #[NUMBER]**

    [Clear, concise question text with relevant context. For code-related MCQs, include a code snippet.]

    \`\`\`[language-lowercase or relevant format]
    [Optional, short snippet (max 8–10 lines) relevant to the question]
    \`\`\`

    **Choose the best answer:**
    🅰️ A) [Option A text - realistic and plausible]
    🅱️ B) [Option B text - realistic and plausible]
    🅲️ C) [Option C text - realistic and plausible]
    🅳️ D) [Option D text - realistic and plausible]

    💡 *Hint: [Provide a concise, helpful hint or context clue without giving away the answer directly]*

2.  **Code Snippet Analysis Format (Enhanced for Code Quality):**
    📝 **Code Analysis Challenge**

    \`\`\`[language-lowercase or relevant format]
    [Provide a runnable snippet that is concise (max 8–10 lines), focusing on the core idea.]
    \`\`\`

    **Question:** [A specific, clear, and challenging question about the code, e.g., "What is the exact output?", "Identify all bugs and propose fixes.", "Explain its time and space complexity and suggest optimizations.", "Describe the design patterns used and their implications."]

3.  **Code Completion Format (Enhanced for Practicality):
    🔧 **Complete the Code**

    \`\`\`[language-lowercase or relevant format]
    [Provide partial code (max 8–10 lines) with a clear placeholder like \`// TODO: Implement this function\` or \`/* YOUR CODE HERE */\`.]
    \`\`\`

    **Requirements:** [Clear, concise, and comprehensive requirements for completing the code. Specify expected functionality, error handling, performance considerations, and any specific design patterns or libraries to use.]

4.  **DSA Challenge Format:**
    🧠 **Algorithm Challenge**

    **Problem:** [A clear, unambiguous problem statement for a data structures and algorithms challenge. Include context if necessary.]
    **Input:** [Detailed input format and constraints (e.g., data types, ranges, size limits).]
    **Output:** [Precise expected output format.]
    **Example:** [At least one clear example with sample input and its corresponding expected output.]

---
**Context Awareness & Personalization:**
You have access to real-time interview context. Use this context to:
- Adapt question difficulty based on the user's *actual performance* (scores, feedback).
- Provide personalized feedback that references their specific strengths and areas for improvement.
- Refer back to previous responses or questions when relevant to maintain continuity.
- Tailor questions to their \`selectedLanguages\` and \`selectedSkillAreas\`.
- **Crucially, when generating code snippets, ensure they are well-formatted, adhere to standard conventions for the specified language, and are realistic for an interview setting.**

---
---
**Available Actions (for internal use, do not mention directly to user):**
You have access to the following actions that you can call during the interview:
1. **scoreAnswer**: To score the user's answer and provide feedback.
2. **askNextQuestion**: To ask the next interview question.
3. **provideHint**: To give helpful hints without giving away answers.
4. **trackProgress**: To update progress metrics.

---
**Question Mix Policy (CRITICAL)**:
  - Primary: MCQ (~70% of turns)
  - Secondary: Code Completion (~15%), Code Analysis (~10%)
  - Occasional: Short free-text (~5%)
  - Always use the exact templates provided for each type.

---
**Your First Response (after language/subject selection):**
"Great choice! To help me tailor this interview perfectly, could you please rate your current proficiency in [Selected Language/Subject] on a scale of 1 to 10 (where 1 is beginner and 10 is expert)?"`;

const ASSISTANT_PROMPT = `You are an AI Interview Assistant, designed to be a helpful, friendly, and educational companion during the user's technical interview. Your purpose is to provide guidance, hints, and clarification on demand.

---
Core Instructions & Persona:
- Language: Respond in English only.
- Assistant Role: You are a supportive guide. Your persona is friendly, encouraging, and focused on facilitating learning.
- Context Awareness (CRITICAL): You will receive the exact text of the current question the Interviewer is asking (if available), as well as the selectedLanguage/Subject for the interview. Use this to provide highly relevant and personalized help.
- Guidance Principle: Help the user understand how to think about the problem. Provide conceptual clarity, analogies, or related examples without giving the direct answer.
- Safe Answers: If asked for the direct answer, politely decline and offer a hint or clarification instead.
- No Interviewing: Do not ask interview questions yourself. You are a supportive assistant.
 - Response Behavior: Always respond to the user's help request first (e.g., hint, explanation, example). Never evaluate or score the user's answer. Do not use any scoring formats.

---
Output and Formatting Policy (MANDATORY):
- Plain text only. Do not use Markdown, code fences, inline backticks, headings, lists, or emojis.
- When you need to show code, write it as normal plain text without any special formatting. Keep it concise and focused.

---
Example User Interactions and Your Responses (plain text only):

User asks: What's a good hint for the Java question about String comparison?
Response: In Java, "==" checks whether two references point to the same object. ".equals()" checks whether two strings have the same characters. Consider whether you need identity or content comparison.

User asks: Can you explain Big O notation to me?
Response: Big O describes how time or space grows with input size. Common orders include O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, and O(n^2) quadratic. It focuses on worst-case growth and ignores constant factors.

User asks: What's the answer to question #3?
Response: I can't provide the direct answer. Tell me what you've tried and I will give a hint or clarify the key idea.

---
Available Actions (for internal use, do not mention directly to user):
1. explainConcept
2. showCodeExample

---
Final Instructions:
- Wait for the user to initiate a conversation.
- Be encouraging and supportive.
- Keep responses concise and helpful.
- Focus on teaching concepts rather than giving direct answers.
- Follow the plain text only policy at all times.
`;

// =============================================================================
// Custom Components (Moved here for clarity and self-containment)
// =============================================================================

// Custom Suggestions List Component (Popup only)
const CustomSuggestionsList = ({ suggestions = [], onSuggestionClick }: RenderSuggestionsListProps) => {
  const wrap = (m: string) =>
    `Assistant request: Reply as the interview assistant. Do not evaluate or score the user's answer. Provide a detailed plain-text response. ${m}`;
  const helperSuggestions = [
    { title: 'Hint', message: 'Give a subtle hint about the current question without revealing the final answer. Nudge me toward the key idea.' },
    { title: 'Approach Outline', message: 'Provide a detailed approach in plain text: overview, steps, why each step works, and when to apply it. Do not give the final code.' },
    { title: 'Step-by-Step', message: 'Guide me step-by-step toward the answer. Explain each step clearly and state why it is necessary. Avoid giving the final answer.' },
    { title: 'Explain Concept', message: 'Explain the underlying concept in plain text with a simple analogy and a tiny plain-text example.' },
    { title: 'Real-Life Example', message: 'Give a practical real-life example that maps to this problem and explain how the mapping helps solve it.' },
    { title: 'Edge Cases', message: 'List important edge cases in plain text and how to handle each one. Explain why each edge case matters.' },
    { title: 'Complexity & Trade-offs', message: 'Analyze time and space complexity for a simple approach and an optimized approach. Explain the trade-offs and when to use each.' },
    { title: 'Debugging Tips', message: 'Suggest targeted debugging checks and common failure points for this type of problem. Mention what each check reveals.' },
    { title: 'Test Cases', message: 'Propose a small set of high-signal test cases as plain text (inputs and expected outputs) to validate a solution.' },
    { title: 'Compare Solutions', message: 'Compare two viable approaches and explain pros, cons, and selection criteria.' },
    { title: 'Optimize Solution', message: 'Assume a baseline solution exists. Suggest concrete optimizations and explain their impact and risks.' },
    { title: 'Constraints Review', message: 'Ask me to confirm constraints and assumptions and explain how they affect the solution approach.' }
  ];

  const contextSuggestions = [
    { title: 'Provide Question', message: 'Here is the exact question I am working on: ' },
    { title: 'Language/Subject', message: 'The language or subject for this question is: ' },
    { title: 'What I Tried', message: 'What I have tried so far: ' },
    { title: 'Constraints', message: 'Key constraints and assumptions are: ' },
    { title: 'Environment', message: 'My environment/framework/tools are: ' },
    { title: 'Error Message', message: 'The error message I am seeing is: ' },
    { title: 'Failing Case', message: 'A failing test case (input and expected vs actual) is: ' }
  ];

  return (
    <div className="suggestions flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <>
          <h2 className="font-semibold text-gray-700">Suggested:</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <RenderSuggestion
                key={`dyn-${index}`}
                title={suggestion.title}
                message={suggestion.message}
                partial={suggestion.partial}
                className="rounded-md border border-gray-400 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-100"
                onClick={() => onSuggestionClick(wrap(suggestion.message))}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="font-semibold text-gray-700">Quick Help:</h2>
      <div className="flex flex-wrap gap-2">
        {helperSuggestions.map((suggestion, index) => (
          <RenderSuggestion
            key={`help-${index}`}
            title={suggestion.title}
            message={suggestion.message}
            partial={false}
            className="rounded-md border border-gray-400 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-100"
            onClick={() => onSuggestionClick(wrap(suggestion.message))}
          />
        ))}
      </div>

      <h2 className="font-semibold text-gray-700 mt-2">Provide Context:</h2>
      <div className="flex flex-wrap gap-2">
        {contextSuggestions.map((suggestion, index) => (
          <RenderSuggestion
            key={`ctx-${index}`}
            title={suggestion.title}
            message={suggestion.message}
            partial={false}
            className="rounded-md border border-gray-400 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-100"
            onClick={() => onSuggestionClick(wrap(suggestion.message))}
          />
        ))}
      </div>
    </div>
  );
};

// Suggestions list for CopilotChat (no assistant wrapping)
const ChatSuggestionsList = ({ suggestions = [], onSuggestionClick }: RenderSuggestionsListProps) => {
  const helperSuggestions = [
    { title: 'Ask for a Hint', message: 'ASSIST: In English only: Could you give me a subtle hint without revealing the full answer?' },
    { title: 'Approach Outline', message: 'ASSIST: In English only: Provide a practical approach outline with steps and why each step matters.' },
    { title: 'Explain Concept', message: 'ASSIST: In English only: Please explain the core concept involved here in simple terms.' },
    { title: 'Step-by-Step', message: 'ASSIST: In English only: Can you guide me step-by-step on how to approach this?' },
    { title: 'Edge Cases', message: 'ASSIST: In English only: What edge cases should I consider for this problem?' },
    { title: 'Debugging Tips', message: 'ASSIST: In English only: Suggest targeted debugging tips and common pitfalls to check.' },
    { title: 'Test Cases', message: 'ASSIST: In English only: Propose a few high-signal test cases with expected outputs.' },
    { title: 'Compare Solutions', message: 'ASSIST: In English only: Compare two viable approaches and when to pick each.' },
    { title: 'Optimize Solution', message: 'ASSIST: In English only: Suggest concrete optimizations and their trade-offs.' },
    { title: 'Real-Life Example', message: 'ASSIST: In English only: Provide a real-life analogy that maps to this problem.' },
    { title: 'Common Mistakes', message: 'ASSIST: In English only: What are common mistakes and how can I avoid them?' },
    { title: 'Pseudocode', message: 'ASSIST: In English only: Provide brief pseudocode to clarify the approach.' },
    { title: 'Visualize Flow', message: 'ASSIST: In English only: Describe the control/data flow to visualize the solution.' },
    { title: 'Complexity', message: 'ASSIST: In English only: What is the expected time and space complexity for an optimal solution?' },
  ];

  const contextSuggestions = [
    { title: 'Provide Question', message: 'ASSIST: In English only: Here is the exact question I am working on: ' },
    { title: 'What I Tried', message: 'ASSIST: In English only: What I have tried so far: ' },
    { title: 'Error Message', message: 'ASSIST: In English only: The error I am seeing is: ' },
    { title: 'Failing Case', message: 'ASSIST: In English only: A failing test case is: ' },
    { title: 'Clarify Constraints', message: 'ASSIST: In English only: Could you clarify the constraints and assumptions?' },
    { title: 'Provide Example', message: 'ASSIST: In English only: Can you provide a small example to illustrate the idea?' },
    { title: 'Compare Approaches', message: 'ASSIST: In English only: How do two common approaches compare, and when should I pick each?' },
  ];

  return (
    <div className="suggestions flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <>
          <h2 className="font-semibold text-gray-700">Suggested:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {suggestions.map((suggestion, index) => (
              <RenderSuggestion
                key={`chat-dyn-${index}`}
                title={suggestion.title}
                message={suggestion.message}
                partial={suggestion.partial}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition-colors"
                onClick={() => onSuggestionClick(suggestion.message)}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="font-semibold text-gray-700">Quick Help:</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {helperSuggestions.map((suggestion, index) => (
          <RenderSuggestion
            key={`chat-help-${index}`}
            title={suggestion.title}
            message={suggestion.message}
            partial={false}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => onSuggestionClick(suggestion.message)}
          />
        ))}
      </div>

      <h2 className="font-semibold text-gray-700 mt-2">Ask for Context:</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {contextSuggestions.map((suggestion, index) => (
          <RenderSuggestion
            key={`chat-ctx-${index}`}
            title={suggestion.title}
            message={suggestion.message}
            partial={false}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => onSuggestionClick(suggestion.message)}
          />
        ))}
      </div>
    </div>
  );
};

// Custom Input Component for Copilot popup/chat
function CustomInput({ inProgress, onSend, isVisible }: InputProps) {
  const handleSubmit = (value: string) => {
    if (value && value.trim().length > 0) {
      const wrapped = `Assistant request: Reply as the interview assistant. Respond in English only. Do not evaluate or score the user's answer. Provide a detailed plain-text response. ${value}`;
      onSend(wrapped);
    }
  };

  const wrapperStyle = "flex gap-2 p-4 border-t";
  const inputStyle = "flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 shadow-sm";
  const buttonStyle = "px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95";
  const chipStyle = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition";

  const helperSuggestions = [
    { title: 'Hint', message: 'Give a subtle hint about the current question without revealing the final answer. Nudge me toward the key idea.' },
    { title: 'Approach Outline', message: 'Provide a detailed approach in plain text: overview, steps, why each step works, and when to apply it. Do not give the final code.' },
    { title: 'Step-by-Step', message: 'Guide me step-by-step toward the answer. Explain each step clearly and state why it is necessary. Avoid giving the final answer.' },
    { title: 'Explain Concept', message: 'Explain the underlying concept in plain text with a simple analogy and a tiny plain-text example.' },
    { title: 'Real-Life Example', message: 'Give a practical real-life example that maps to this problem and explain how the mapping helps solve it.' },
    { title: 'Edge Cases', message: 'List important edge cases in plain text and how to handle each one. Explain why each edge case matters.' },
    { title: 'Complexity & Trade-offs', message: 'Analyze time and space complexity for a simple approach and an optimized approach. Explain the trade-offs and when to use each.' },
    { title: 'Debugging Tips', message: 'Suggest targeted debugging checks and common failure points for this type of problem. Mention what each check reveals.' },
    { title: 'Test Cases', message: 'Propose a small set of high-signal test cases as plain text (inputs and expected outputs) to validate a solution.' },
    { title: 'Compare Solutions', message: 'Compare two viable approaches and explain pros, cons, and selection criteria.' },
    { title: 'Optimize Solution', message: 'Assume a baseline solution exists. Suggest concrete optimizations and explain their impact and risks.' },
    { title: 'Constraints Review', message: 'Ask me to confirm constraints and assumptions and explain how they affect the solution approach.' }
  ];

  const contextSuggestions = [
    { title: 'Provide Question', message: 'Here is the exact question I am working on: ' },
    { title: 'Language/Subject', message: 'The language or subject for this question is: ' },
    { title: 'What I Tried', message: 'What I have tried so far: ' },
    { title: 'Constraints', message: 'Key constraints and assumptions are: ' },
    { title: 'Environment', message: 'My environment/framework/tools are: ' },
    { title: 'Error Message', message: 'The error message I am seeing is: ' },
    { title: 'Failing Case', message: 'A failing test case (input and expected vs actual) is: ' }
  ];

  if (!isVisible) return null;

  return (
    <div className="flex flex-col">
      {/* Distinct answer choice buttons for evaluation */}
      <div className="flex gap-2 px-4 pt-3">
        {['A','B','C','D'].map((choice) => (
          <button
            key={`ans-${choice}`}
            type="button"
            className="px-3 py-1 rounded-md text-white text-sm shadow-sm border-2"
            style={{
              background: choice === 'A' ? '#1f2937' : choice === 'B' ? '#0f766e' : choice === 'C' ? '#7c2d12' : '#111827',
              borderColor: choice === 'A' ? '#60a5fa' : choice === 'B' ? '#34d399' : choice === 'C' ? '#fbbf24' : '#f87171'
            }}
            disabled={inProgress}
            onClick={() => handleSubmit(`Answer: ${choice}`)}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-4 pt-3">
        {helperSuggestions.map((s, i) => (
          <button
            key={`help-${i}`}
            type="button"
            className={chipStyle}
            disabled={inProgress}
            onClick={() => handleSubmit(s.message)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1">
        {contextSuggestions.map((s, i) => (
          <button
            key={`ctx-${i}`}
            type="button"
            className={chipStyle}
            disabled={inProgress}
            onClick={() => handleSubmit(s.message)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className={wrapperStyle}>
        <input
          disabled={inProgress}
          type="text"
          placeholder="Ask your question here..."
          className={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.currentTarget as HTMLInputElement).value;
              handleSubmit(value);
              (e.currentTarget as HTMLInputElement).value = '';
            }
          }}
        />
        <button
          disabled={inProgress}
          className={buttonStyle}
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            const value = input?.value || '';
            handleSubmit(value);
            if (input) input.value = '';
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}

// Input for CopilotChat (no assistant wrapping, suggestions to guide learning)
function InterviewerChatInput({ inProgress, onSend, isVisible }: InputProps) {
  const handleSubmit = (value: string) => {
    if (value && value.trim().length > 0) {
      onSend(value);
    }
  };

  const wrapperStyle = "flex gap-2 p-4 border-t";
  const inputStyle = "flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 shadow-sm";
  const buttonStyle = "px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95";
  const chipStyle = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition";

  const helperSuggestions = [
    { title: 'Hint', message: 'ASSIST: In English only: Could you give me a subtle hint?' },
    { title: 'Approach Outline', message: 'ASSIST: In English only: Provide a practical approach outline with steps and why each step matters.' },
    { title: 'Explain Concept', message: 'ASSIST: In English only: Please explain the underlying concept in simple terms.' },
    { title: 'Step-by-Step', message: 'ASSIST: In English only: Can you break down the approach step-by-step?' },
    { title: 'Edge Cases', message: 'ASSIST: In English only: What edge cases should I watch out for?' },
    { title: 'Debugging Tips', message: 'ASSIST: In English only: Suggest targeted debugging tips and common pitfalls to check.' },
    { title: 'Test Cases', message: 'ASSIST: In English only: Propose a few high-signal test cases with expected outputs.' },
    { title: 'Compare Solutions', message: 'ASSIST: In English only: Compare two viable approaches and when to pick each.' },
    { title: 'Optimize Solution', message: 'ASSIST: In English only: Suggest concrete optimizations and their trade-offs.' },
    { title: 'Real-Life Example', message: 'ASSIST: In English only: Provide a real-life analogy that maps to this problem.' },
    { title: 'Common Mistakes', message: 'ASSIST: In English only: What are common mistakes and how can I avoid them?' },
    { title: 'Pseudocode', message: 'ASSIST: In English only: Provide brief pseudocode to clarify the approach.' },
    { title: 'Visualize Flow', message: 'ASSIST: In English only: Describe the control/data flow to visualize the solution.' },
    { title: 'Complexity', message: 'ASSIST: In English only: What is the expected time and space complexity?' },
  ];

  const contextSuggestions = [
    { title: 'Provide Question', message: 'ASSIST: In English only: Here is the exact question I am working on: ' },
    { title: 'What I Tried', message: 'ASSIST: In English only: What I have tried so far: ' },
    { title: 'Error Message', message: 'ASSIST: In English only: The error I am seeing is: ' },
    { title: 'Failing Case', message: 'ASSIST: In English only: A failing test case is: ' },
    { title: 'Clarify Constraints', message: 'ASSIST: In English only: Could you clarify the constraints and assumptions?' },
    { title: 'Provide Example', message: 'ASSIST: In English only: Can you share a small example to illustrate?' },
    { title: 'Compare Approaches', message: 'ASSIST: In English only: How do different approaches compare here?' },
  ];

  if (!isVisible) return null;

  return (
    <div className="flex flex-col">
      {/* Answer choice buttons with distinct UI for evaluation */}
      <div className="flex gap-2 px-4 pt-3">
        {['A','B','C','D'].map((choice) => (
          <button
            key={`answer-${choice}`}
            type="button"
            className="px-3 py-1 rounded-md text-white text-sm shadow-sm border-2 transition-transform active:scale-95"
            style={{
              background: choice === 'A' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : choice === 'B' ? 'linear-gradient(135deg,#10b981,#047857)' : choice === 'C' ? 'linear-gradient(135deg,#f59e0b,#b45309)' : 'linear-gradient(135deg,#ef4444,#991b1b)',
              borderColor: choice === 'A' ? '#93c5fd' : choice === 'B' ? '#6ee7b7' : choice === 'C' ? '#fcd34d' : '#fca5a5'
            }}
            disabled={inProgress}
            onClick={() => handleSubmit(`Answer: ${choice}`)}
          >
            {choice}
          </button>
        ))}
      </div>
      {/* Action buttons: Evaluate and Next Question */}
      <div className="flex gap-2 px-4 pt-2">
        <button
          type="button"
          className="px-3 py-1 rounded-md text-white text-sm shadow-sm border-2 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            borderColor: '#a5b4fc'
          }}
          disabled={inProgress}
          onClick={() => handleSubmit('ASSIST: Please EVALUATE my latest answer in detail. Explain the reasoning, why it is correct or wrong, and the full context of the response.')}
        >
          Evaluate (Explain)
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-md text-white text-sm shadow-sm border-2 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
            borderColor: '#5eead4'
          }}
          disabled={inProgress}
          onClick={() => handleSubmit('ASSIST: NEXT QUESTION, please.')}
        >
          Next Question
        </button>
      </div>
      <div className="flex flex-wrap gap-2 px-4 pt-3">
        {helperSuggestions.map((s, i) => (
          <button
            key={`ich-help-${i}`}
            type="button"
            className={chipStyle}
            disabled={inProgress}
            onClick={() => handleSubmit(s.message)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1">
        {contextSuggestions.map((s, i) => (
          <button
            key={`ich-ctx-${i}`}
            type="button"
            className={chipStyle}
            disabled={inProgress}
            onClick={() => handleSubmit(s.message)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className={wrapperStyle}>
        <input
          disabled={inProgress}
          type="text"
          placeholder="Type your answer or ask for guidance..."
          className={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.currentTarget as HTMLInputElement).value;
              handleSubmit(value);
              (e.currentTarget as HTMLInputElement).value = '';
            }
          }}
        />
        <button
          disabled={inProgress}
          className={buttonStyle}
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            const value = input?.value || '';
            handleSubmit(value);
            if (input) input.value = '';
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main App Component
// =============================================================================

export default function InterviewApp() {
  const { 
    isInterviewActive, 
    selectedLanguage, 
    startInterview, 
    resetInterview,
    responses,
    getAverageScore,
    _hasHydrated,
    setHasHydrated
  } = useInterviewState();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isInterviewerChatOpen, setIsInterviewerChatOpen] = useState(false);
  const { toast } = useToast();

  // Dynamic interviewer instructions bound to the selected language/subject
  const interviewerInstructions = useMemo(() => {
    const subjectLine = selectedLanguage ? `Selected Subject: ${selectedLanguage}` : 'Selected Subject: (none)';
    return `${subjectLine}\n\n${INTERVIEWER_PROMPT}\n\nOperational Rules:\n- If user sends 'Answer: X' (X in A-D) or a single letter A/B/C/D, evaluate and score.\n- If user sends a message starting with 'ASSIST:', provide detailed assistance without scoring (hints, explanations, step-by-step, edge cases, complexity, evaluation rationale on request).\n- On 'ASSIST: NEXT QUESTION', proceed to ask the next question according to the Question Mix Policy.`;
  }, [selectedLanguage]);

  // Custom actions for the AI Interviewer
  useCopilotAction({
    name: "scoreAnswer",
    description: "Score the user's answer and provide feedback. Use this when the user provides an answer to an interview question.",
    parameters: [
      {
        name: "score",
        type: "number",
        description: "Score out of 10 (1-10)",
      },
      {
        name: "feedback",
        type: "string",
        description: "Constructive feedback on the answer",
      },
      {
        name: "strengths",
        type: "string",
        description: "What the user did well",
      },
      {
        name: "improvements",
        type: "string",
        description: "Areas for improvement",
      }
    ],
    handler: async ({ score, feedback, strengths, improvements }) => {
      console.log(`Scored answer: ${score}/10`);
      console.log(`Feedback: ${feedback}`);
      console.log(`Strengths: ${strengths}`);
      console.log(`Improvements: ${improvements}`);
      
      return {
        success: true,
        message: `Answer scored: ${score}/10. ${feedback}`
      };
    },
  });

  useCopilotAction({
    name: "askNextQuestion",
    description: "Ask the next interview question. Use this after scoring an answer to proceed to the next question.",
    parameters: [
      {
        name: "questionType",
        type: "string",
        description: "Type of question (MCQ, Code Analysis, Code Completion, DSA Challenge)",
      },
      {
        name: "difficulty",
        type: "string",
        description: "Difficulty level (Easy, Medium, Hard)",
      },
      {
        name: "language",
        type: "string",
        description: "Programming language for the question",
      }
    ],
    handler: async ({ questionType, difficulty, language }) => {
      console.log(`Asking ${difficulty} ${questionType} question for ${language}`);
      
      return {
        success: true,
        message: `Preparing ${difficulty} ${questionType} question for ${language}`
      };
    },
  });

  useCopilotAction({
    name: "provideHint",
    description: "Provide a helpful hint to the user without giving away the complete answer.",
    parameters: [
      {
        name: "hint",
        type: "string",
        description: "The hint to provide to the user",
      },
      {
        name: "category",
        type: "string",
        description: "Category of hint (concept, approach, syntax, etc.)",
      }
    ],
    handler: async ({ hint, category }) => {
      console.log(`Providing ${category} hint: ${hint}`);
      
      return {
        success: true,
        message: `Hint provided: ${hint}`
      };
    },
  });

  useCopilotAction({
    name: "trackProgress",
    description: "Track the user's interview progress and performance metrics.",
    parameters: [
      {
        name: "questionsAnswered",
        type: "number",
        description: "Number of questions answered so far",
      },
      {
        name: "averageScore",
        type: "number",
        description: "Current average score",
      },
      {
        name: "timeSpent",
        type: "string",
        description: "Time spent in the interview",
      }
    ],
    handler: async ({ questionsAnswered, averageScore, timeSpent }) => {
      console.log(`Progress: ${questionsAnswered} questions, ${averageScore} avg score, ${timeSpent}`);
      
      return {
        success: true,
        message: `Progress tracked: ${questionsAnswered} questions completed`
      };
    },
  });

  // Custom actions for the AI Assistant
  useCopilotAction({
    name: "explainConcept",
    description: "Explain a programming concept in simple terms with examples.",
    parameters: [
      {
        name: "concept",
        type: "string",
        description: "The programming concept to explain",
      },
      {
        name: "language",
        type: "string",
        description: "Programming language context",
      },
      {
        name: "level",
        type: "string",
        description: "Explanation level (beginner, intermediate, advanced)",
      }
    ],
    handler: async ({ concept, language, level }) => {
      console.log(`Explaining ${concept} for ${language} at ${level} level`);
      
      return {
        success: true,
        message: `Explained ${concept} for ${language} (${level} level)`
      };
    },
  });

  useCopilotAction({
    name: "showCodeExample",
    description: "Show a code example to illustrate a concept.",
    parameters: [
      {
        name: "example",
        type: "string",
        description: "The code example to show",
      },
      {
        name: "language",
        type: "string",
        description: "Programming language of the example",
      },
      {
        name: "description",
        type: "string",
        description: "Brief description of what the example demonstrates",
      }
    ],
    handler: async ({ example, language, description }) => {
      console.log(`Showing ${language} example: ${description}`);
      
      return {
        success: true,
        message: `Showed ${language} example: ${description}`
      };
    },
    });

  // Provide context to the AI Interviewer
  const interviewContextId = useCopilotReadable({
    description: "Current interview state and progress",
    value: {
      isInterviewActive,
      selectedLanguage,
      questionsAnswered: responses.length,
      averageScore: getAverageScore(),
      currentSession: {
        startTime: isInterviewActive ? new Date().toISOString() : null,
        duration: isInterviewActive ? "Active session" : "No active session"
      }
    }
  });

  // Provide language-specific context
  useCopilotReadable({
    description: "Selected programming language and its characteristics",
    value: {
      language: selectedLanguage,
      languageFeatures: selectedLanguage === 'JavaScript' ? {
        focusAreas: ['ES6+ features', 'Async programming', 'DOM manipulation', 'Closures', 'Prototypal inheritance'],
        difficulty: 'Medium to Advanced',
        commonTopics: ['Promises', 'async/await', 'Arrow functions', 'Destructuring', 'Modules']
      } : selectedLanguage === 'Python' ? {
        focusAreas: ['Pythonic code', 'List comprehensions', 'Decorators', 'Exception handling', 'Memory management'],
        difficulty: 'Easy to Advanced',
        commonTopics: ['List comprehensions', 'Generators', 'Context managers', 'EAFP principle', 'Popular libraries']
      } : selectedLanguage === 'Java' ? {
        focusAreas: ['OOP principles', 'Collections framework', 'Exception handling', 'Memory management', 'Concurrency'],
        difficulty: 'Medium to Advanced',
        commonTopics: ['ArrayList', 'HashMap', 'Generics', 'Checked exceptions', 'Threading']
      } : selectedLanguage === 'C++' ? {
        focusAreas: ['Memory management', 'STL containers', 'Templates', 'Exception handling', 'Performance optimization'],
        difficulty: 'Advanced',
        commonTopics: ['Pointers', 'Smart pointers', 'RAII', 'Move semantics', 'STL algorithms']
      } : {
        focusAreas: ['Core concepts', 'Best practices', 'Performance considerations'],
        difficulty: 'Varies',
        commonTopics: ['Fundamentals', 'Advanced concepts', 'Best practices']
      }
    },
    parentId: interviewContextId
  });

  // Provide recent performance context
  useCopilotReadable({
    description: "Recent interview performance and responses",
    value: {
      recentResponses: responses.slice(-3).map((response, index) => ({
        questionNumber: responses.length - 2 + index,
        score: response.score,
        timestamp: new Date().toISOString(),
        performance: response.score >= 8 ? 'Excellent' : response.score >= 6 ? 'Good' : 'Needs Improvement'
      })),
      performanceTrend: responses.length > 0 ? {
        lastThreeScores: responses.slice(-3).map(r => r.score),
        averageLastThree: responses.slice(-3).reduce((sum, r) => sum + r.score, 0) / Math.min(3, responses.length),
        improvement: responses.length >= 2 ? responses[responses.length - 1].score > responses[responses.length - 2].score : null
      } : null
    },
    parentId: interviewContextId
  });

  // Provide interview session context
  useCopilotReadable({
    description: "Interview session configuration and settings",
    value: {
      sessionSettings: {
        maxQuestions: 10,
        adaptiveDifficulty: true,
        scoringEnabled: true,
        feedbackEnabled: true,
        hintSystem: true
      },
      currentQuestion: responses.length + 1,
      sessionProgress: {
        percentage: Math.min((responses.length / 10) * 100, 100),
        stage: responses.length < 3 ? 'Warm-up' : responses.length < 7 ? 'Core' : 'Advanced'
      }
    },
    parentId: interviewContextId
  });

  // Provide user interaction context
  useCopilotReadable({
    description: "User interaction patterns and preferences",
    value: {
      userBehavior: {
        averageResponseTime: "2-3 minutes",
        detailLevel: responses.length > 0 ? 
          responses.filter(r => r.score >= 8).length > responses.length / 2 ? 'High' : 'Medium' : 'Unknown',
        helpRequests: 0, // This could be tracked separately
        preferredQuestionTypes: responses.length > 0 ? {
          totalQuestions: responses.length,
          averageScore: getAverageScore(),
          scoreDistribution: {
            excellent: responses.filter(r => r.score >= 8).length,
            good: responses.filter(r => r.score >= 6 && r.score < 8).length,
            needsImprovement: responses.filter(r => r.score < 6).length
          }
        } : null
      }
    },
    parentId: interviewContextId
  });

  // Provide context to the AI Assistant
  const assistantContextId = useCopilotReadable({
    description: "Current interview context for the assistant",
    value: {
      currentLanguage: selectedLanguage,
      interviewProgress: {
        questionsAnswered: responses.length,
        averageScore: getAverageScore(),
        isActive: isInterviewActive
      },
      recentPerformance: responses.length > 0 ? {
        lastScore: responses[responses.length - 1].score,
        trend: responses.length >= 2 ? 
          responses[responses.length - 1].score > responses[responses.length - 2].score ? 'Improving' : 'Declining' : 'Stable'
      } : null
    }
  });

  // Provide language-specific help context for assistant
  useCopilotReadable({
    description: "Language-specific help areas and common challenges",
    value: {
      language: selectedLanguage,
      commonChallenges: selectedLanguage === 'JavaScript' ? [
        'Understanding closures and scope',
        'Async programming with Promises',
        'ES6+ features and modern syntax',
        'Prototypal inheritance vs classical',
        'Event handling and DOM manipulation'
      ] : selectedLanguage === 'Python' ? [
        'Pythonic code', 'List comprehensions', 'Decorators', 'Exception handling', 'Memory management'
      ] : selectedLanguage === 'Java' ? [
        'OOP principles', 'Collections framework', 'Exception handling', 'Memory management', 'Concurrency'
      ] : selectedLanguage === 'C++' ? [
        'Memory management', 'STL containers', 'Templates', 'Exception handling', 'Performance optimization'
      ] : [
        'Core concepts', 'Best practices', 'Performance considerations', 'Common pitfalls'
      ],
      helpfulResources: selectedLanguage === 'JavaScript' ? [
        'MDN Web Docs', 'JavaScript.info', 'ES6+ features guide', 'Async/await patterns'
      ] : selectedLanguage === 'Python' ? [
        'Python official docs', 'Real Python tutorials', 'Python decorators guide', 'Context managers tutorial'
      ] : selectedLanguage === 'Java' ? [
        'Oracle Java docs', 'Java collections tutorial', 'Concurrency in practice', 'Effective Java book'
      ] : selectedLanguage === 'C++' ? [
        'C++ reference', 'STL documentation', 'Modern C++ features', 'RAII and smart pointers'
      ] : [
        'Language official docs', 'Best practices guides', 'Performance tutorials'
      ]
    },
    parentId: assistantContextId
  });
   
  const handleLanguageSelection = useCallback((language: string) => {
    try {
      startInterview(language);
      setIsInterviewerChatOpen(true);
    } catch (err: any) {
      toast({
        title: 'Unable to start interview',
        description: err?.message || 'Unknown error occurred',
      });
    }
  }, [startInterview, toast]);

  const handleResetInterview = useCallback(() => {
    try {
      resetInterview();
      setIsPopupOpen(false);
      setIsInterviewerChatOpen(false);
    } catch (err: any) {
      toast({
        title: 'Reset failed',
        description: err?.message || 'Unknown error occurred',
      });
    }
  }, [resetInterview, toast]);

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  // Dynamic suggestions for the popup chat based on real-time interview state
  useCopilotChatSuggestions(
    {
      instructions:
        `You are generating plain-text button suggestions for an assistant popup. ` +
        `The goal is to guide the user toward understanding and a solution with high-signal prompts. ` +
        `Prefer concise labels that elicit detailed, explanatory responses when clicked. ` +
        `Examples: Hint, Approach Outline, Step-by-Step, Explain Concept, Real-Life Example, Edge Cases, Complexity & Trade-offs, Debugging Tips, Test Cases, Compare Solutions, Optimize Solution, Constraints Review. ` +
        `Selected subject: ${selectedLanguage || 'unknown'}. ` +
        `Incorporate recent performance and progress to tailor the level of detail.`,
      minSuggestions: 1,
      maxSuggestions: 3,
    },
    [selectedLanguage, responses.length, isInterviewActive, getAverageScore()]
  );
  
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading InterviewXP...</p>
        </div>
      </div>
    );
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InterviewXP
              </h1>
            </div>
            
            {isInterviewActive && (
              <Button
                onClick={handleResetInterview}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Interview</span>
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!isInterviewActive ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                  >
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">AI-Powered Interview Practice</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                      Master Your
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {' '}Technical Interview
                      </span>
                    </h2>
                    
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Practice with our AI interviewer, get real-time feedback, and build confidence 
                      for your next technical interview. Choose your language and start improving today.
                    </p>
                  </motion.div>

                  {/* Language Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <LanguageSelector onSelect={handleLanguageSelection} />
                  </motion.div>
                </div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid md:grid-cols-3 gap-6 mb-12"
                >
                  {[
                    {
                      icon: <Brain className="w-8 h-8" />,
                      title: 'AI-Powered Questions',
                      description: 'Dynamic questions that adapt to your skill level and provide personalized challenges.',
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      icon: <Code className="w-8 h-8" />,
                      title: 'Multiple Formats',
                      description: 'Practice MCQs, code analysis, algorithm challenges, and system design problems.',
                      color: 'from-purple-500 to-pink-500'
                    },
                    {
                      icon: <MessageSquare className="w-8 h-8" />,
                      title: 'Real-time Feedback',
                      description: 'Get instant scoring and detailed explanations to improve your performance.',
                      color: 'from-green-500 to-teal-500'
                    }
                  ].map((feature, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-center">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
              >
                {/* Gemini-like Interview Chat - full width/height */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedLanguage} Technical Interview
                        </h2>
                        <p className="text-gray-600">Interactive session • Real-time feedback</p>
                      </div>
                    </motion.div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setIsInterviewerChatOpen(true)}
                        variant="outline"
                        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border-0"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Start Interview
                      </Button>
                      <Button
                        onClick={() => setIsPopupOpen(true)}
                        variant="outline"
                        className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 border-0"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Get Help
                      </Button>
                    </div>
                  </div>

                  <CopilotSuggestions isVisible={isInterviewActive} />

                  <AnimatePresence>
                    {isInterviewerChatOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <Card className="shadow-xl border-0 bg-white flex flex-col w-full">
                          <div className="copilot-chat-header">
                            <div className="flex items-center space-x-3">
                              <div className="copilot-chat-avatar copilot-chat-assistant-avatar">
                                <Brain className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{selectedLanguage} Interviewer</h3>
                                <p className="text-sm text-gray-600">AI-powered technical interview session</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-0">
                            <div
                              className="w-full gemini-chat copilot-chat-container"
                            >
                              {/* Guidance Banner */}
                              <div className="mb-3 mx-3 mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 text-blue-700" />
                                <div>
                                  <div className="font-medium">How to use this chat</div>
                                  <div className="text-blue-800/90">Use A/B/C/D to submit answers for scoring. Use the chips for hints and explanations. Click Evaluate for a detailed rationale, or Next Question to proceed.</div>
                                </div>
                              </div>
                              <CopilotChat
                                instructions={interviewerInstructions}
                                labels={{
                                  title: `${selectedLanguage} Interviewer`,
                                  initial: `Welcome to your ${selectedLanguage} interview. Let's begin when you are ready.`,
                                  placeholder: "Your answer...",
                                }}
                                className="w-full"
                                Input={InterviewerChatInput}
                                RenderSuggestionsList={ChatSuggestionsList}
                              />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>


        {/* AI Assistant Popup (CopilotPopup) */}
        {isInterviewActive && (
          <div
            style={
              {"--copilot-kit-primary-color": "#10a37f", // ChatGPT's primary green for accents/buttons
      "--copilot-kit-secondary-color": "#343541", // Slightly lighter dark background for secondary elements
      "--copilot-kit-accent-color": "#19c37d", // A brighter green accent
      "--copilot-kit-background-color": "#FFFFFF", // Main dark background
      "--copilot-kit-text-color": "#ececf1", // Light text color for contrast on dark background
      "--copilot-kit-border-color": "#40414f", // Subtle border/divider color
      "--copilot-kit-shadow": "0 4px 32px 0 rgba(0, 0, 0, 0.5)", // Stronger shadow for depth on dark
      "--copilot-kit-border-radius": "12px", // Consistent with ChatGPT's rounded corners
      "--copilot-kit-font-family": "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      "--copilot-kit-popup-width": "480px",
      "--copilot-kit-popup-height": "600px",
      "--copilot-kit-popup-max-width": "95vw",
      "--copilot-kit-popup-max-height": "90vh",
              } as CopilotKitCSSProperties
            }
          >
            <CopilotKit runtimeUrl='/api/copilotkit'>
              <CopilotPopup  
              instructions={ASSISTANT_PROMPT}
              labels={{
                title: `${selectedLanguage} Interview Assistant`,
                initial: `Hi! I'm your ${selectedLanguage} interview assistant. I can provide hints, explain concepts, give short code as plain text, break down problems, and suggest approaches. Ask for help with any question you're working on.`,
                placeholder: 'Ask for hints, explanations, or help...',
              }}
              defaultOpen={isPopupOpen}
            />
            </CopilotKit>
          </div>
          
        )}
        
      </div>
      
    </CopilotKit>
  );
}