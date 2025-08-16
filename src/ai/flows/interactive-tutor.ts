"use server";
/**
 * @fileOverview An interactive tutor AI agent that generates a lesson with an image and audio.
 *
 * - generateTutorLesson - A function that handles the lesson generation process.
 * - TutorLessonInput - The input type for the generateTutorLesson function.
 * - TutorLessonOutput - The return type for the generateTutorLesson function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const TutorLessonInputSchema = z.object({
  topic: z.string().describe("The topic for the lesson."),
});
export type TutorLessonInput = z.infer<typeof TutorLessonInputSchema>;

const TutorLessonOutputSchema = z.object({
  title: z.string().describe("The title of the lesson."),
  introduction: z.string().describe("A brief introduction to the topic."),
  sections: z
    .array(
      z.object({
        title: z.string().describe("The title of the lesson section."),
        content: z
          .string()
          .describe(
            "The content of the lesson section, in a single paragraph."
          ),
      })
    )
    .describe("An array of sections for the lesson."),
  image: z
    .string()
    .describe(
      "A visually engaging and relevant image for the lesson, as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type TutorLessonOutput = z.infer<typeof TutorLessonOutputSchema>;

export async function generateTutorLesson(
  input: TutorLessonInput
): Promise<TutorLessonOutput> {
  return interactiveTutorFlow(input);
}

const lessonPrompt = ai.definePrompt({
  name: "tutorLessonPrompt",
  input: { schema: TutorLessonInputSchema },
  output: {
    schema: z.object({
      title: z.string().describe("The title of the lesson."),
      introduction: z.string().describe("A brief introduction to the topic."),
      sections: z
        .array(
          z.object({
            title: z.string().describe("The title of the lesson section."),
            content: z
              .string()
              .describe(
                "The content of the lesson section, in a single paragraph."
              ),
          })
        )
        .describe("An array of sections for the lesson."),
    }),
  },
  prompt: `You are an expert educator creating a mini-lesson.
  
  Topic: {{{topic}}}
  
  Generate a lesson with a title, a short introduction, and 2-3 sections with their own titles and content.
  Keep the content for each section to a single, concise paragraph.
  This lesson will be narrated, so write in a clear, conversational style.
  `,
});

const imagePrompt = ai.definePrompt({
  name: "tutorImagePrompt",
  input: { schema: TutorLessonInputSchema },
  output: {
    schema: z.object({
      image: z
        .string()
        .describe(
          "A visually engaging and relevant image for the lesson, as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
        ),
    }),
  },
  prompt: `Generate a visually engaging, educational, and artistic header image for a lesson about '{{{topic}}}'. The style should be modern and clean. Abstract concepts are preferred over literal depictions.`,
});

const interactiveTutorFlow = ai.defineFlow(
  {
    name: "interactiveTutorFlow",
    inputSchema: TutorLessonInputSchema,
    outputSchema: TutorLessonOutputSchema,
  },
  async (input) => {
    // Run content generation and image generation in parallel
    const [lessonResult, imageResult] = await Promise.all([
      lessonPrompt(input),
      (async () => {
        const { media } = await ai.generate({
          model: "googleai/gemini-2.0-flash-preview-image-generation",
          prompt: `Generate a visually engaging, educational, and artistic header image for a lesson about '${input.topic}'. The style should be modern and clean. Abstract concepts are preferred over literal depictions.`,
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        });
        return { image: media?.url };
      })(),
    ]);

    if (!lessonResult.output || !imageResult.image) {
      throw new Error("Failed to generate lesson content or image.");
    }

    return {
      ...lessonResult.output,
      image: imageResult.image,
    };
  }
);
