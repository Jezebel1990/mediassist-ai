"use client";

import { useState } from "react";

import { askQuestion } from "@/services/chat.service";

import { ChatComposer } from "./ChatComposer";
import { ChatLoadingAssistant } from "./ChatLoadingAssistant";
import { ChatMessageList } from "./ChatMessageList";
import { ChatWelcome } from "./ChatWelcome";
import { CHAT_FRIENDLY_ERROR, createMessageId } from "./constants";
import type { ChatMessage, ChatSourceRef } from "./types";

function normalizeSources(
  sources: { document: string; pages?: number[]; page?: number | null }[],
): ChatSourceRef[] {
  const byDocument = new Map<string, number[]>();

  for (const source of sources) {
    const existing = byDocument.get(source.document) ?? [];
    const pages = source.pages?.length
      ? source.pages
      : source.page != null
        ? [source.page]
        : [];
    for (const page of pages) {
      if (!existing.includes(page)) {
        existing.push(page);
      }
    }
    byDocument.set(source.document, existing);
  }

  return Array.from(byDocument.entries()).map(([document, pages]) => ({
    document,
    pages: [...pages].sort((a, b) => a - b),
  }));
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasConversation = messages.length > 0;

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await askQuestion(trimmed);
      const answer =
        response.answer?.trim() ||
        "Desculpe, ainda não encontrei essa informação na Base de Conhecimento.\n\nVocê pode adicionar novos documentos para ampliar meu conhecimento.";

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: answer,
        sources: normalizeSources(response.sources ?? []),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: CHAT_FRIENDLY_ERROR,
        sources: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectSuggestion(question: string) {
    setDraft(question);
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-md">
      <div className="relative min-h-0 pt-2 flex-1 overflow-y-auto px-3 sm:px-4">
        {hasConversation ? (
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            bottomSpacer={isLoading}
          />
        ) : (
          <ChatWelcome
            onSelectSuggestion={handleSelectSuggestion}
            disabled={isLoading}
          />
        )}

        {isLoading && hasConversation ? <ChatLoadingAssistant /> : null}
      </div>

      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={sendQuestion}
        disabled={isLoading}
        className="shrink-0 rounded-b-xl"
      />
    </div>
  );
}
