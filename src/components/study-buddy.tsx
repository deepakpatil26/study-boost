"use client";

import { Send, Trash2 } from "lucide-react";
import { useChat } from "ai/react";
import { useToast } from "@/hooks/use-toast";

import { ChatLayout } from "./chat-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

export function StudyBuddy() {
  const { toast } = useToast();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
  } = useChat({
    api: "/api/study-buddy",
    streamProtocol: "text",
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description:
          error.message ||
          "Failed to connect to Study Buddy. Please check your internet connection and try again.",
      });
    },
  });

  // Show error details in development
  React.useEffect(() => {
    if (error && process.env.NODE_ENV === "development") {
      console.error("Detailed error:", error);
    }
  }, [error]);

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  const clearMessages = () => {
    setMessages([]);
    toast({
      title: "Conversation cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const formComponent = (
    <div className="p-4 space-y-4">
      <form
        onSubmit={customHandleSubmit}
        className="flex items-end gap-3 max-w-4xl mx-auto"
      >
        <div className="flex-1 min-w-0 space-y-2">
          <Input
            placeholder="Ask your study buddy anything..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="off"
            className={`
              min-h-[48px] resize-none border-2 transition-all duration-200
              focus:border-primary/50 focus:ring-2 focus:ring-primary/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading ? "bg-muted/50" : ""}
            `}
            maxLength={1000}
          />
          {input.length > 800 && (
            <div className="text-xs text-muted-foreground text-right">
              {input.length}/1000 characters
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="lg"
          className={`
            h-[48px] px-6 shrink-0 transition-all duration-200
            hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${isLoading ? "animate-pulse" : ""}
          `}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Sending...</span>
            </div>
          ) : (
            <>
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </Button>
      </form>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
          {[
            "Explain quantum physics",
            "Help with math homework",
            "Study tips for exams",
            "Write an essay outline",
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() =>
                handleInputChange({ target: { value: suggestion } } as any)
              }
              className="text-xs hover:bg-primary/10 transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <Card className="flex flex-col h-full shadow-xl border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="flex-row items-center justify-between space-y-0 py-4 px-6 border-b bg-gradient-to-r from-background via-background to-muted/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-lg">
                    SB
                  </span>
                </div>
              </div>
              {isLoading && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Study Buddy
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Thinking..." : "Ready to help"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Message count */}
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </span>
            )}

            {/* Clear button */}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                aria-label="Clear conversation history"
                className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">Clear</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Chat Content */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ChatLayout
            messages={messages}
            isLoading={isLoading}
            form={formComponent}
          />
        </CardContent>
      </Card>
    </div>
  );
}
