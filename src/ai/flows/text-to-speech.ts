"use server";
/**
 * @fileOverview A Text-to-Speech (TTS) AI flow.
 *
 * - synthesizeSpeech - Converts text into audible speech.
 * - SynthesizeSpeechInput - The input type for the synthesizeSpeech function.
 * - SynthesizeSpeechOutput - The return type for the synthesizeSpeech function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import wav from "wav";
import { googleAI } from "@genkit-ai/googleai";

const SynthesizeSpeechInputSchema = z.string();
export type SynthesizeSpeechInput = z.infer<typeof SynthesizeSpeechInputSchema>;

const SynthesizeSpeechOutputSchema = z.object({
  audio: z.string().describe("The base64 encoded WAV audio data URI."),
});
export type SynthesizeSpeechOutput = z.infer<
  typeof SynthesizeSpeechOutputSchema
>;

export async function synthesizeSpeech(
  input: SynthesizeSpeechInput
): Promise<SynthesizeSpeechOutput> {
  return synthesizeSpeechFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on("error", reject);
    writer.on("data", function (d) {
      bufs.push(d);
    });
    writer.on("end", function () {
      resolve(Buffer.concat(bufs).toString("base64"));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const synthesizeSpeechFlow = ai.defineFlow(
  {
    name: "synthesizeSpeechFlow",
    inputSchema: SynthesizeSpeechInputSchema,
    outputSchema: SynthesizeSpeechOutputSchema,
  },
  async (text) => {
    const { media } = await ai.generate({
      model: googleAI.model("gemini-2.5-flash-preview-tts"),
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Algenib" },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error("No audio media was returned from the AI model.");
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(",") + 1),
      "base64"
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audio: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
