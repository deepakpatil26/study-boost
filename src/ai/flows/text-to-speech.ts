'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) handler using Web Speech API.
 *
 * - synthesizeSpeech - Prepares text for browser-based Web Speech API synthesis.
 * - SynthesizeSpeechInput - The input type for the synthesizeSpeech function.
 * - SynthesizeSpeechOutput - The return type for the synthesizeSpeech function.
 */

import { z } from 'genkit';

const SynthesizeSpeechInputSchema = z.string();
export type SynthesizeSpeechInput = z.infer<typeof SynthesizeSpeechInputSchema>;

const SynthesizeSpeechOutputSchema = z.object({
  text: z
    .string()
    .describe('The text to be synthesized by the browser Web Speech API.'),
});
export type SynthesizeSpeechOutput = z.infer<
  typeof SynthesizeSpeechOutputSchema
>;

export async function synthesizeSpeech(
  input: SynthesizeSpeechInput,
): Promise<SynthesizeSpeechOutput> {
  // Web Speech API is used on the frontend (client-side)
  // This function simply returns the text to be synthesized
  // The actual speech synthesis happens in the browser using the Web Speech API

  return {
    text: input,
  };
}
