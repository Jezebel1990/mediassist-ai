"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { ChatAgentAvatar } from "./ChatAgentAvatar";
import { pickLoadingMessage } from "./constants";

type ChatLoadingAssistantProps = {
  className?: string;
};

/**
 * Floating assistant shown in the bottom-left of the chat area while the
 * model is generating a reply. Uses the existing float/shadow CSS animations.
 */
export function ChatLoadingAssistant({ className }: ChatLoadingAssistantProps) {
  const [message, setMessage] = useState(() => pickLoadingMessage());

  useEffect(() => {
    setMessage(pickLoadingMessage());
    const intervalId = window.setInterval(() => {
      setMessage((current) => pickLoadingMessage(current));
    }, 2800);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[min(100%,20rem)] items-end gap-3 sm:bottom-4 sm:left-4",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <ChatAgentAvatar size={72} className="mx-0 shrink-0 drop-shadow-md" />
      <div className="mb-3 rounded-2xl rounded-bl-md border border-border/60 bg-card px-3 py-2 shadow-md">
        <p className="text-xs font-medium leading-snug text-foreground sm:text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
