// QuizGenerator flow generates grade-appropriate multiple-choice quizzes on a given topic.

'use server';

import { groqClient } from '@/ai/genkit';
import { z } from 'zod';
import { QuizQuestion } from '@/lib/types';

const QuizGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  gradeLevel: z.string().describe('The grade level of the quiz.'),
  numberOfQuestions: z
    .number()
    .describe('The number of questions in the quiz.'),
});

export type QuizGeneratorInput = z.infer<typeof QuizGeneratorInputSchema>;

const QuizGeneratorOutputSchema = z.object({
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(
          z.object({
            text: z.string(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    )
    .describe('The generated quiz in JSON format.'),
});

export type QuizGeneratorOutput = z.infer<typeof QuizGeneratorOutputSchema>;

export async function generateQuiz(
  input: QuizGeneratorInput,
): Promise<QuizGeneratorOutput> {
  try {
    const prompt = `You are a quiz generator that generates multiple-choice quizzes based on the given topic and grade level.

Topic: ${input.topic}
Grade Level: ${input.gradeLevel}
Number of Questions: ${input.numberOfQuestions}

Generate a quiz with the specified number of questions, and provide 4 answer options for each question. Mark the correct answer with a boolean field called "isCorrect".

Return the quiz in a JSON format inside a 'quiz' field. The value of the 'quiz' field must be a JSON array of objects, where each object represents a question.

Example output for a 2-question quiz:
{
  "quiz": [
    {
      "question": "Question 1 text...",
      "options": [
        { "text": "Answer 1", "isCorrect": false },
        { "text": "Answer 2", "isCorrect": true },
        { "text": "Answer 3", "isCorrect": false },
        { "text": "Answer 4", "isCorrect": false }
      ]
    },
    {
      "question": "Question 2 text...",
      "options": [
        { "text": "Answer A", "isCorrect": false },
        { "text": "Answer B", "isCorrect": false },
        { "text": "Answer C", "isCorrect": true },
        { "text": "Answer D", "isCorrect": false }
      ]
    }
  ]
}`;

    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const responseText = response.choices[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz content');
    }

    const quizData = JSON.parse(jsonMatch[0]);

    return quizData as QuizGeneratorOutput;
  } catch (error) {
    console.error('Error generating quiz with Groq:', error);
    throw error;
  }
}
