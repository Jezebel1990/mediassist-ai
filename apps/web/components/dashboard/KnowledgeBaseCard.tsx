import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DocumentList, type KnowledgeDocument } from "@/components/documents";
import { cn } from "@/lib/utils";

type KnowledgeBaseCardProps = {
  documents: KnowledgeDocument[];
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  toolbar?: ReactNode;
  emptyDescription?: string;
  renderActions?: (document: KnowledgeDocument) => ReactNode;
};

export function KnowledgeBaseCard({
  documents,
  className,
  title = "Base de Conhecimento",
  description = "Gerencie os documentos utilizados pelo agente inteligente.",
  actions,
  footer,
  toolbar,
  emptyDescription,
  renderActions,
}: KnowledgeBaseCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-md", className)}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator className="bg-border/60" />
        {toolbar}
        {footer}
        <DocumentList
          documents={documents}
          emptyDescription={emptyDescription}
          renderActions={renderActions}
        />
      </CardContent>
    </Card>
  );
}
