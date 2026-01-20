'use server';
/**
 * @fileOverview A friendly chatbot AI agent called "Study Buddy" using Groq.
 */

import { groqClient } from '@/ai/genkit';
import { z } from 'zod';

const StudyBuddyInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'assistant']),
        content: z.string(),
      }),
    )
    .describe('The history of the conversation.'),
  message: z.string().describe("The user's latest message."),
});

export type StudyBuddyInput = z.infer<typeof StudyBuddyInputSchema>;

export async function askStudyBuddy(input: StudyBuddyInput) {
  try {
    console.log(
      'Processing request with history length:',
      input.history.length,
    );
    console.log('User message:', input.message);

    // Convert history to Groq format
    const messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [
      {
        role: 'system',
        content: `You are Study Buddy, a friendly and encouraging AI tutor. Your goal is to help users learn and understand various topics.

Guidelines:
- Be patient, positive, and supportive
- Provide clear, simple explanations
- Break down complex problems into smaller steps
- Keep responses conversational and engaging
- Use the conversation history to maintain context`,
      },
      ...input.history.map((msg) => ({
        role:
          msg.role === 'model'
            ? 'assistant'
            : (msg.role as 'user' | 'assistant'),
        content: msg.content,
      })),
    ];

    // Add current user message
    messages.push({
      role: 'user',
      content: input.message,
    });

    // Call Groq API
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Latest production model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Extract response text
    const responseText = response.choices[0]?.message?.content || '';
    return responseText;
  } catch (error) {
    console.error('askStudyBuddy error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (
        error.message.includes('quota') ||
        error.message.includes('rate limit')
      ) {
        throw new Error(
          'Study Buddy is temporarily unavailable due to usage limits. Please try again in a few minutes.',
        );
      }
      if (error.message.includes('API key')) {
        throw new Error(
          'Study Buddy configuration error. Please check API keys.',
        );
      }
    }

    throw error;
  }
}
