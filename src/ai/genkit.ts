import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { Groq } from 'groq-sdk';

// Initialize Groq client for direct API calls
export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
