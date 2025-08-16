"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { Logo } from "./icons";
import { User } from "lucide-react";

interface ChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  form: React.ReactNode;
}

export function ChatLayout({ messages, isLoading, form }: ChatLayoutProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  return (
    <div className="flex h-full w-full flex-col">
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-6 py-6 min-h-full">
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <Avatar className="h-16 w-16 border-2">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Logo className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold">
                  Welcome to Study Buddy!
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  I'm here to help you learn and understand various topics. Ask
                  me anything about your studies, homework, or any concept you'd
                  like to explore!
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={cn(
                "flex items-start gap-4 group",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* Assistant Avatar */}
              {message.role === "assistant" && (
                <Avatar className="h-9 w-9 border shrink-0 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Logo className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Content */}
              <div
                className={cn(
                  "relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] rounded-2xl p-4 text-sm shadow-sm transition-all duration-200",
                  "break-words overflow-wrap-anywhere whitespace-pre-wrap",
                  "group-hover:shadow-md",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border rounded-bl-md"
                )}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                }}
              >
                {/* Message text with better formatting */}
                <div className="leading-relaxed">
                  {message.content.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < message.content.split("\n").length - 1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Optional timestamp */}
                <div
                  className={cn(
                    "text-xs mt-2 opacity-0 group-hover:opacity-70 transition-opacity",
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* User Avatar */}
              {message.role === "user" && (
                <Avatar className="h-9 w-9 border shrink-0 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-start gap-4 justify-start group">
              <Avatar className="h-9 w-9 border shrink-0 mt-1">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Logo className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-md bg-card border p-4 text-sm shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  </div>
                  <span className="text-muted-foreground ml-1">
                    Study Buddy is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      {/* Form Container */}
      <div className="border-t bg-card/50 backdrop-blur-sm">{form}</div>
    </div>
  );
}
