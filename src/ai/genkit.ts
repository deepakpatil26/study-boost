import { Groq } from 'groq-sdk';

// Initialize Groq client for direct API calls
// Groq is used for all LLM tasks: Study Buddy, Interactive Tutor, Quiz Generator, Concept Explorer
export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});
