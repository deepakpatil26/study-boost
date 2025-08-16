"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { generateQuiz } from "@/ai/flows/quiz-generator";
import type { Quiz as QuizType } from "@/lib/types";
import { useChatHistory } from "@/hooks/use-chat-history";
import { QuizDisplay } from "@/components/quiz-display";
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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatLayout } from "./chat-layout";
import { Slider } from "./ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const formSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters."),
  gradeLevel: z.string({ required_error: "Please select a grade level." }),
  numberOfQuestions: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export function QuizGenerator() {
  const { messages, addMessage, clearMessages, setMessages } = useChatHistory(
    "quiz-generator-history"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [lastQuiz, setLastQuiz] = useState<QuizType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numberOfQuestions: 5,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const userMessage = `Generate a quiz about "${values.topic}" for a ${values.gradeLevel} grader with ${values.numberOfQuestions} questions.`;
    addMessage({ role: "user", content: userMessage });
    setIsLoading(true);
    setLastQuiz(null);
    setIsFormOpen(false);

    try {
      const quizData = await generateQuiz(values);
      setLastQuiz(quizData);
      addMessage({
        role: "assistant",
        content: `A quiz on "${values.topic}" has been generated. You can now take the quiz below.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred.",
        description:
          "Failed to generate quiz. The AI might be busy. Please try again.",
      });
      addMessage({
        role: "assistant",
        content:
          "I was unable to generate a quiz for that topic. Please try a different topic or try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearMessages();
    setLastQuiz(null);
    setIsFormOpen(true);
  };

  const formComponent = (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., The Solar System"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={`${i + 1}th`}>
                          {i + 1}th Grade
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "Generating Quiz..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz Generator</h2>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        )}
      </div>

      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <CollapsibleContent>{formComponent}</CollapsibleContent>
      </Collapsible>

      {messages.length > 0 && !isFormOpen && !isLoading && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setIsFormOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Generate Another Quiz
          </Button>
        </div>
      )}

      {isLoading && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg p-6 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:0.2s]" />
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary [animation-delay:0.4s]" />
          </div>
          <p className="ml-4">Generating your quiz...</p>
        </Card>
      )}

      {lastQuiz && !isLoading && (
        <QuizDisplay quizData={lastQuiz} topic={form.getValues("topic")} />
      )}
    </div>
  );
}
