import type { ReactNode } from "react";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

import { DocumentBadge } from "./DocumentBadge";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { getDocumentIcon, type KnowledgeDocument } from "./types";

type DocumentRowProps = {
  document: KnowledgeDocument;
  actions?: ReactNode;
  className?: string;
};

export function DocumentRow({
  document,
  actions,
  className,
}: DocumentRowProps) {
  const Icon = getDocumentIcon(document.formatKey) ?? FileText;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {document.name}
            </p>
            <DocumentBadge
              formatKey={document.formatKey}
              extension={document.extension}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {document.chunks} {document.chunks === 1 ? "fragmento" : "fragmentos"}
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
            <span>Enviado em {document.uploadedAt}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <DocumentStatusBadge status={document.status} />
        {actions}
      </div>
    </li>
  );
}
