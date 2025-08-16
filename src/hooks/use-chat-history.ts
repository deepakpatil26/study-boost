"use client";

import { useState, useEffect, useCallback } from "react";
import type { Message } from "@/lib/types";
import { nanoid } from "nanoid";

// This hook is no longer used by StudyBuddy, but might be useful for other chat features.

export function useChatHistory(storageKey: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(storageKey);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as Message[];
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Failed to save messages to localStorage", error);
    }
  }, [messages, storageKey]);

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...message, id: nanoid() },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { messages, addMessage, clearMessages, setMessages };
}
