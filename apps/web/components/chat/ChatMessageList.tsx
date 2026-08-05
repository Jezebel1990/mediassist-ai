"use client";

import { useEffect, useRef } from "react";

import { ChatAssistantMessage } from "./ChatAssistantMessage";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatUserMessage } from "./ChatUserMessage";
import type { ChatMessage } from "./types";

type ChatMessageListProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  /** Extra bottom padding so the floating loading assistant never covers bubbles. */
  bottomSpacer?: boolean;
};

export function ChatMessageList({
  messages,
  isLoading = false,
  bottomSpacer = false,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, bottomSpacer]);

  return (
    <div className="flex flex-col gap-4 px-1 py-2 sm:px-2">
      {messages.map((message) =>
        message.role === "user" ? (
          <ChatUserMessage key={message.id} content={message.content} />
        ) : (
          <ChatAssistantMessage
            key={message.id}
            content={message.content}
            sources={message.sources}
          />
        ),
      )}

      {isLoading ? <ChatTypingIndicator /> : null}
      {bottomSpacer ? (
        <div aria-hidden className="h-24 w-full shrink-0 sm:h-28" />
      ) : null}
      <div ref={endRef} aria-hidden className="h-px w-full shrink-0" />
    </div>
  );
}
