"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap,
  Send,
  Volume2,
  Loader2,
  Play,
  Pause,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { nanoid } from "nanoid";

import {
  generateTutorLesson,
  TutorLessonOutput,
} from "@/ai/flows/interactive-tutor";
import { synthesizeSpeech } from "@/ai/flows/text-to-speech";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters."),
});

type AudioState = "idle" | "loading" | "playing" | "paused";

interface LessonChunk {
  id: string;
  type: "intro" | "section";
  title?: string;
  text: string;
  audioSrc: string | null;
}

export function InteractiveTutor() {
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<TutorLessonOutput | null>(null);
  const [lessonChunks, setLessonChunks] = useState<LessonChunk[]>([]);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "" },
  });

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioState("idle");
    setCurrentlyPlaying(null);
  };

  const resetState = () => {
    setIsLoading(false);
    setLesson(null);
    setLessonChunks([]);
    stopPlayback();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    resetState();
    setIsLoading(true);

    try {
      const result = await generateTutorLesson({ topic: values.topic });
      setLesson(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred.",
        description: "Failed to generate lesson. Please try again.",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!lesson) return;

    const generateAudioForLesson = async () => {
      try {
        const chunks: LessonChunk[] = [
          {
            id: nanoid(),
            type: "intro",
            text: lesson.introduction,
            audioSrc: null,
          },
          ...lesson.sections.map((s) => ({
            id: nanoid(),
            type: "section" as const,
            title: s.title,
            text: s.content,
            audioSrc: null,
          })),
        ];

        setLessonChunks(chunks);

        for (let i = 0; i < chunks.length; i++) {
          const { audio } = await synthesizeSpeech(chunks[i].text);
          setLessonChunks((prev) => {
            const newChunks = [...prev];
            newChunks[i].audioSrc = audio;
            return newChunks;
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: "Could not generate audio for the lesson.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateAudioForLesson();
  }, [lesson, toast]);

  const playFullLesson = async () => {
    if (audioState === "playing") {
      stopPlayback();
      return;
    }

    if (audioState === "paused" && audioRef.current) {
      audioRef.current.play();
      setAudioState("playing");
      return;
    }

    setAudioState("playing");
    for (const chunk of lessonChunks) {
      if (chunk.audioSrc) {
        setCurrentlyPlaying(chunk.id);
        await playAudio(chunk.audioSrc);
        if (!audioRef.current) break; // Playback was stopped
      }
    }
    stopPlayback();
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioState("paused");
    }
  };

  const playAudio = (src: string) => {
    return new Promise<void>((resolve) => {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => {
        resolve();
      };
      audioRef.current.play();
    });
  };

  const isAudioReady =
    lessonChunks.length > 0 && lessonChunks.every((c) => c.audioSrc !== null);

  const renderAudioIcon = () => {
    if (isLoading && !lesson) return null;
    if (!isAudioReady && lesson) return <Loader2 className="animate-spin" />;
    if (audioState === "playing") return <Pause />;
    if (audioState === "paused") return <Play />;
    return <Volume2 />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Interactive Tutor</h2>
      </div>

      {!lesson && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Start a New Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-start gap-4"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="sr-only">Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Black Holes"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="icon"
                  aria-label="Generate Lesson"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isLoading && !lesson && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-8 w-1/3 mt-4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      )}

      {lesson && (
        <Card className="shadow-lg animate-in fade-in-50">
          <CardHeader>
            <div className="relative h-64 w-full rounded-t-lg overflow-hidden">
              {lesson.image ? (
                <Image
                  src={lesson.image}
                  alt={lesson.title}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <Skeleton className="h-full w-full" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                <CardTitle className="text-center text-3xl font-bold text-white tracking-tight">
                  {lesson.title}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap />
                <span className="text-sm">Your personal lesson is ready</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={
                    audioState === "playing" ? pausePlayback : playFullLesson
                  }
                  disabled={!isAudioReady || (isLoading && !!lesson)}
                >
                  {renderAudioIcon()}
                </Button>
                <Button variant="ghost" size="icon" onClick={resetState}>
                  <RefreshCcw />
                </Button>
              </div>
            </div>

            {lessonChunks.map((chunk) => (
              <div key={chunk.id}>
                {chunk.type === "section" && (
                  <h3 className="font-bold text-lg mb-2">{chunk.title}</h3>
                )}
                <p
                  className={cn(
                    "text-base leading-relaxed transition-colors duration-300",
                    currentlyPlaying === chunk.id
                      ? "text-primary"
                      : "text-foreground/80",
                    !chunk.audioSrc && "text-muted-foreground"
                  )}
                >
                  {chunk.text}
                  {!chunk.audioSrc && (
                    <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />
                  )}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
