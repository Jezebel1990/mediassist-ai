"use client";

import { MessageCircleQuestion } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SuggestionPrompt } from "./types";

type ChatSuggestionCardProps = {
  suggestion: SuggestionPrompt;
  onSelect: (label: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ChatSuggestionCard({
  suggestion,
  onSelect,
  disabled = false,
  className,
}: ChatSuggestionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(suggestion.label)}
      className={cn(
        "group text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <Card className="h-full gap-3 border-border/60 shadow-md transition-shadow group-hover:shadow-md group-hover:border-primary/30">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageCircleQuestion className="size-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-sm font-semibold leading-snug tracking-tight">
              {suggestion.label}
            </CardTitle>
            <CardDescription className="text-xs">
              Clique para preencher a pergunta
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </button>
  );
}
