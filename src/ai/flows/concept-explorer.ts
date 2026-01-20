'use server';
/**
 * @fileOverview A concept explainer AI agent using Groq.
 *
 * - explainConcept - A function that handles the concept explanation process.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import { groqClient } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainConceptInputSchema = z.object({
  topic: z.string().describe('The topic to explain.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the topic.'),
  examples: z
    .string()
    .describe('Examples of the topic, formatted as a list with newlines.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(
  input: ExplainConceptInput,
): Promise<ExplainConceptOutput> {
  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert in explaining complex topics in a simple and easy-to-understand manner.

Your task is to provide a concise summary and examples of the given topic. For the examples, please format them as a list, with each example on a new line.

Topic: ${input.topic}

Respond in JSON format with "summary" and "examples" fields:
{
  "summary": "...",
  "examples": "- Example 1\\n- Example 2\\n- Example 3"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = response.choices[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse concept explanation');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      summary: data.summary,
      examples: data.examples,
    };
  } catch (error) {
    console.error('Error explaining concept with Groq:', error);
    throw error;
  }
}
