import type { ReactNode } from "react";
import type { Message as VercelMessage } from "ai";

export interface Message extends VercelMessage {
  // Add any custom fields here if needed
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface Quiz {
  quiz: QuizQuestion[];
}
