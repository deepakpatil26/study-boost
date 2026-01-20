'use server';
/**
 * @fileOverview An interactive tutor AI agent that generates a lesson with an image and audio.
 *
 * - generateTutorLesson - A function that handles the lesson generation process.
 * - TutorLessonInput - The input type for the generateTutorLesson function.
 * - TutorLessonOutput - The return type for the generateTutorLesson function.
 */

import { groqClient } from '@/ai/genkit';
import { z } from 'zod';

const TutorLessonInputSchema = z.object({
  topic: z.string().describe('The topic for the lesson.'),
});
export type TutorLessonInput = z.infer<typeof TutorLessonInputSchema>;

const TutorLessonOutputSchema = z.object({
  title: z.string().describe('The title of the lesson.'),
  introduction: z.string().describe('A brief introduction to the topic.'),
  sections: z
    .array(
      z.object({
        title: z.string().describe('The title of the lesson section.'),
        content: z
          .string()
          .describe(
            'The content of the lesson section, in a single paragraph.',
          ),
      }),
    )
    .describe('An array of sections for the lesson.'),
  image: z
    .string()
    .optional()
    .describe(
      'A visually engaging and relevant image for the lesson, as a data URI (optional).',
    ),
});
export type TutorLessonOutput = z.infer<typeof TutorLessonOutputSchema>;

export async function generateTutorLesson(
  input: TutorLessonInput,
): Promise<TutorLessonOutput> {
  try {
    // Generate lesson content and image in parallel
    const [lessonResult, imageUrl] = await Promise.all([
      generateLessonWithGroq(input.topic),
      generateImageFromHuggingFace(
        `Generate a visually engaging, educational, and artistic header image for a lesson about '${input.topic}'. The style should be modern and clean. Abstract concepts are preferred over literal depictions.`,
      ),
    ]);

    return {
      ...lessonResult,
      image: imageUrl,
    };
  } catch (error) {
    console.error('Error generating tutor lesson:', error);
    throw error;
  }
}

// Generate lesson content using Groq API
async function generateLessonWithGroq(topic: string) {
  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert educator creating a mini-lesson.

Topic: ${topic}

Generate a lesson with:
1. A title
2. A short introduction to the topic
3. 2-3 sections, each with a title and content

Format your response as JSON with this structure:
{
  "title": "string",
  "introduction": "string",
  "sections": [
    {"title": "string", "content": "string"},
    {"title": "string", "content": "string"}
  ]
}

Keep each section content to a single, concise paragraph. Write in a clear, conversational style suitable for narration.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const responseText = response.choices[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse lesson content');
    }

    const lessonData = JSON.parse(jsonMatch[0]);

    return {
      title: lessonData.title,
      introduction: lessonData.introduction,
      sections: lessonData.sections,
    };
  } catch (error) {
    console.error('Error generating lesson with Groq:', error);
    throw error;
  }
}

// Function to generate image using Hugging Face API (free Stable Diffusion)
async function generateImageFromHuggingFace(
  prompt: string,
): Promise<string | undefined> {
  try {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      console.warn('HUGGINGFACE_API_KEY not set. Image generation skipped.');
      return undefined;
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      {
        headers: { Authorization: `Bearer ${hfApiKey}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          wait_for_model: true,
        }),
      },
    );

    if (!response.ok) {
      console.warn(`HF API error: ${response.status} ${response.statusText}`);
      return undefined;
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('Image generation failed:', error);
    return undefined;
  }
}
