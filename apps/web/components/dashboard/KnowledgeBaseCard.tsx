import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { DocumentStatus, KnowledgeDocument } from "./constants";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: LucideIcon }
> = {
  indexado: {
    label: "Indexado",
    variant: "default",
    icon: CircleCheck,
  },
  processando: {
    label: "Processando",
    variant: "secondary",
    icon: RefreshCw,
  },
  pendente: {
    label: "Pendente",
    variant: "outline",
    icon: Clock,
  },
  falhou: {
    label: "Falhou",
    variant: "destructive",
    icon: CircleAlert,
  },
};

type DocumentListProps = {
  documents: KnowledgeDocument[];
  className?: string;
};

export function DocumentList({ documents, className }: DocumentListProps) {
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
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione arquivos para começar a indexação.
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-0 divide-y divide-border/60", className)}>
      {documents.map((doc) => {
        const status = statusConfig[doc.status];
        const StatusIcon = status.icon;

        return (
          <li
            key={doc.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" strokeWidth={1.75} />
              </div>

              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {doc.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{doc.type}</span>
                  <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
                  <span>
                    {doc.chunks} {doc.chunks === 1 ? "chunk" : "chunks"}
                  </span>
                  <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
                  <span>Enviado em {doc.uploadedAt}</span>
                </div>
              </div>
            </div>

            <Badge variant={status.variant} className="w-fit gap-1.5">
              <StatusIcon className="size-3" strokeWidth={2} />
              {status.label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

type KnowledgeBaseCardProps = {
  documents: KnowledgeDocument[];
  className?: string;
  actions?: ReactNode;
  footer?: ReactNode;
};

export function KnowledgeBaseCard({
  documents,
  className,
  actions,
  footer,
}: KnowledgeBaseCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-md", className)}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Base de Conhecimento
          </CardTitle>
          <CardDescription>
            Gerencie os documentos utilizados pelo agente inteligente.
          </CardDescription>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator className="bg-border/60" />
        {footer}
        <DocumentList documents={documents} />
      </CardContent>
    </Card>
  );
}
