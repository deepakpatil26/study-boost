"use server";
/**
 * @fileOverview A concept explainer AI agent.
 *
 * - explainConcept - A function that handles the concept explanation process.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExplainConceptInputSchema = z.object({
  topic: z.string().describe("The topic to explain."),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the topic."),
  examples: z
    .string()
    .describe("Examples of the topic, formatted as a list with newlines."),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(
  input: ExplainConceptInput
): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: "explainConceptPrompt",
  input: { schema: ExplainConceptInputSchema },
  output: { schema: ExplainConceptOutputSchema },
  prompt: `You are an expert in explaining complex topics in a simple and easy-to-understand manner.

  Your task is to provide a concise summary and examples of the given topic. For the examples, please format them as a list, with each example on a new line.

  Topic: {{{topic}}}

  For example, if the topic is "The Solar System", the examples could be:
  - Mercury
  - Venus
  - Earth
  - Mars
  - Jupiter
  - Saturn
  - Uranus
  - Neptune
  `,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: "explainConceptFlow",
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
