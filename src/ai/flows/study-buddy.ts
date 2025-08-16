"use server";
/**
 * @fileOverview A friendly chatbot AI agent called "Study Buddy" using Genkit.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const StudyBuddyInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model", "assistant"]),
        content: z.string(),
      })
    )
    .describe("The history of the conversation."),
  message: z.string().describe("The user's latest message."),
});

export type StudyBuddyInput = z.infer<typeof StudyBuddyInputSchema>;

export async function askStudyBuddy(input: StudyBuddyInput) {
  try {
    console.log(
      "Processing request with history length:",
      input.history.length
    );
    console.log("User message:", input.message);

    // Build the conversation context as a single prompt
    let prompt = `You are Study Buddy, a friendly and encouraging AI tutor. Your goal is to help users learn and understand various topics.

Guidelines:
- Be patient, positive, and supportive
- Provide clear, simple explanations
- Break down complex problems into smaller steps
- Keep responses conversational and engaging
- Use the conversation history to maintain context

`;

    // Add conversation history if available
    if (input.history.length > 0) {
      prompt += "Previous conversation:\n";
      input.history.forEach((msg) => {
        const speaker = msg.role === "assistant" ? "Study Buddy" : "User";
        prompt += `${speaker}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    // Add the current user message
    prompt += `User: ${input.message}\n\nStudy Buddy: `;

    // Use the simple generate method with string prompt
    const response = await ai.generate(prompt);

    // Return the response text
    return response.text;
  } catch (error) {
    console.error("askStudyBuddy error:", error);

    // Handle rate limit errors specifically for free tier
    if (error instanceof Error) {
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        throw new Error(
          "Study Buddy is temporarily unavailable due to usage limits. Please try again in a few minutes."
        );
      }
      if (error.message.includes("API key")) {
        throw new Error(
          "Study Buddy configuration error. Please check the API key."
        );
      }
    }

    throw new Error(
      `Study Buddy failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`
    );
  }
}
