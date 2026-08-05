import type { ReactNode } from "react";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

import { DocumentRow } from "./DocumentRow";
import type { KnowledgeDocument } from "./types";

type DocumentListProps = {
  documents: KnowledgeDocument[];
  className?: string;
  emptyDescription?: string;
  renderActions?: (document: KnowledgeDocument) => ReactNode;
};

export function DocumentList({
  documents,
  className,
  emptyDescription = "Nenhum documento encontrado.",
  renderActions,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-12 text-center",
          className,
        )}
      >
        <FileText className="mb-3 size-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">
          Nenhum documento encontrado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-0 divide-y divide-border/60", className)}>
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          document={doc}
          actions={renderActions?.(doc)}
        />
      ))}
    </ul>
  );
}
