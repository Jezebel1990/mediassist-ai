"use client";

import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { formatSourcePages } from "./constants";
import type { ChatSourceRef } from "./types";

type ChatAssistantMessageProps = {
  content: string;
  sources?: ChatSourceRef[];
  className?: string;
};

export function ChatAssistantMessage({
  content,
  sources = [],
  className,
}: ChatAssistantMessageProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <Card className="w-full max-w-[92%] gap-3 border-border/60 shadow-md sm:max-w-[85%]">
        <CardHeader className="space-y-0 px-4 pb-0 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            MediAssist AI
          </p>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {content}
          </p>

          {sources.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Fontes utilizadas
              </p>
              <ul className="flex flex-col gap-2">
                {sources.map((source) => {
                  const pagesLabel = formatSourcePages(source.pages);
                  return (
                    <li
                      key={source.document}
                      className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
                    >
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-3.5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {source.document}
                        </p>
                        {pagesLabel ? (
                          <p className="text-xs text-muted-foreground">
                            {pagesLabel}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
