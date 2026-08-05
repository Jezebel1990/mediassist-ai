"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleCheck,
  Clock,
  Database,
  FileStack,
  FileText,
  Layers,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import {
  DocumentFilter,
  DocumentList,
  FORMAT_DISPLAY_ORDER,
  FORMAT_LABELS,
  documentsErrorMessage,
  formatDocumentDate,
  toKnowledgeDocument,
  type DocumentFormatFilter,
  type KnowledgeDocument,
} from "@/components/documents";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getDocumentsStatus,
  listDocuments,
  type DocumentsStatusResponse,
} from "@/services/documents.service";

function shortModelName(modelName: string | undefined): string {
  if (!modelName) {
    return "—";
  }
  const withoutProvider = modelName.includes("/")
    ? modelName.split("/").pop() ?? modelName
    : modelName;
  return withoutProvider.replace(/:free$/i, "");
}

function formatLastIndexed(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  return formatDocumentDate(iso, { withTime: true });
}

function operationalLabel(status: DocumentsStatusResponse | null): string {
  if (!status) {
    return "—";
  }
  if (status.failed > 0) {
    return "Atenção";
  }
  if (status.index_exists || status.indexed > 0) {
    return "Operacional";
  }
  if (status.total === 0) {
    return "Vazio";
  }
  return "Pendente";
}

export function DashboardOverview() {
  const [status, setStatus] = useState<DocumentsStatusResponse | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [filter, setFilter] = useState<DocumentFormatFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [list, nextStatus] = await Promise.all([
          listDocuments(),
          getDocumentsStatus(),
        ]);
        if (!cancelled) {
          setDocuments(list.documents.map(toKnowledgeDocument));
          setStatus(nextStatus);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            documentsErrorMessage(error, "Falha ao carregar o dashboard."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    if (filter === "all") {
      return documents;
    }
    return documents.filter((doc) => doc.formatKey === filter);
  }, [documents, filter]);

  const byFormat = status?.by_format ?? {};

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Documentos Indexados"
          value={status ? String(status.indexed) : "—"}
          description="Arquivos disponíveis para consulta"
          icon={FileText}
        />
        <StatsCard
          title="Modelo IA"
          value={shortModelName(status?.model_name)}
          description="Modelo ativo para respostas"
          icon={MessageSquare}
        />
        <StatsCard
          title="Status"
          value={operationalLabel(status)}
          description="Todos os serviços online"
          icon={CircleCheck}
        />
        <StatsCard
          title="Última Atualização"
          value={formatLastIndexed(status?.last_indexed_at)}
          description="Base sincronizada recentemente"
          icon={Clock}
        />
      </section>

      <Card className="border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Base de Conhecimento
          </CardTitle>
          <CardDescription>
            Visão informativa da base utilizada pelo assistente. A administração
            de documentos é feita em Base de Conhecimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator className="bg-border/60" />

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando estatísticas…
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoStat
                icon={FileStack}
                label="Total de documentos"
                value={String(status?.total ?? 0)}
              />
              <InfoStat
                icon={Layers}
                label="Fragmentos de texto"
                value={String(status?.total_chunks ?? 0)}
              />
              <InfoStat
                icon={Clock}
                label="Última atualização"
                value={formatLastIndexed(status?.last_indexed_at)}
              />
              <InfoStat
                icon={Database}
                label="Condição operacional"
                value={status?.index_exists ? "Pronto" : "Não criado"}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Documentos por formato
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {FORMAT_DISPLAY_ORDER.map((key) => (
                <div
                  key={key}
                  className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <p className="text-xs text-muted-foreground">
                    {FORMAT_LABELS[key] ?? key.toUpperCase()}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {byFormat[key] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Documentos</p>
              <p className="text-sm text-muted-foreground">
                Listagem somente leitura. Filtre por formato para refinar a
                visualização.
              </p>
            </div>
            <DocumentFilter value={filter} onChange={setFilter} />
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando documentos…
              </div>
            ) : (
              <DocumentList
                documents={filteredDocuments}
                emptyDescription={
                  filter === "all"
                    ? "Nenhum documento indexado ainda."
                    : "Nenhum documento neste formato."
                }
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
