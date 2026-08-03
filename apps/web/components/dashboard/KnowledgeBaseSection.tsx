"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DocumentsApiError,
  getDocumentsStatus,
  listDocuments,
  processDocuments,
  reindexDocuments,
  uploadDocuments,
  type ApiDocumentStatus,
  type DocumentResponse,
  type DocumentsStatusResponse,
} from "@/services/documents.service";

import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import {
  ACCEPTED_DOCUMENT_TYPES,
  type DocumentStatus,
  type KnowledgeDocument,
} from "./constants";

type BusyAction = "idle" | "upload" | "process" | "reindex" | "loading";

type KnowledgeBaseSectionProps = {
  onStatusChange?: (status: DocumentsStatusResponse | null) => void;
};

function mapApiStatus(status: ApiDocumentStatus): DocumentStatus {
  switch (status) {
    case "indexed":
      return "indexado";
    case "processing":
    case "processed":
      return "processando";
    case "failed":
      return "falhou";
    case "uploaded":
    default:
      return "pendente";
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function toKnowledgeDocument(doc: DocumentResponse): KnowledgeDocument {
  return {
    id: doc.id,
    name: doc.original_filename,
    status: mapApiStatus(doc.status),
    uploadedAt: formatDate(doc.created_at),
    type: doc.extension.replace(".", "").toUpperCase() || "FILE",
    chunks: doc.chunk_count,
  };
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof DocumentsApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function KnowledgeBaseSection({
  onStatusChange,
}: KnowledgeBaseSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [status, setStatus] = useState<DocumentsStatusResponse | null>(null);
  const [busy, setBusy] = useState<BusyAction>("loading");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Carregando base…");

  async function refresh() {
    const [list, nextStatus] = await Promise.all([
      listDocuments(),
      getDocumentsStatus(),
    ]);
    setDocuments(list.documents.map(toKnowledgeDocument));
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setBusy("loading");
        setProgress(30);
        setProgressLabel("Carregando documentos…");
        await refresh();
        if (!cancelled) {
          setProgress(100);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(errorMessage(error, "Falha ao carregar a base."));
          onStatusChange?.(null);
        }
      } finally {
        if (!cancelled) {
          setBusy("idle");
          setProgress(0);
          setProgressLabel("");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydrate
  }, []);

  function handleSelectFiles() {
    fileInputRef.current?.click();
  }

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }

    try {
      setBusy("upload");
      setProgress(20);
      setProgressLabel(`Enviando ${files.length} arquivo(s)…`);
      const result = await uploadDocuments(files);
      setProgress(80);
      setProgressLabel("Atualizando lista…");
      await refresh();
      setProgress(100);

      const uploadedCount = result.uploaded.length;
      if (uploadedCount > 0) {
        toast.success(
          `${uploadedCount} arquivo(s) enviado(s). Clique em Processar para indexar.`,
        );
      }
      if (result.rejected.length > 0) {
        toast.error(result.rejected.join("\n"));
      }
    } catch (error) {
      toast.error(errorMessage(error, "Falha no upload."));
    } finally {
      setBusy("idle");
      setProgress(0);
      setProgressLabel("");
    }
  }

  async function handleProcess() {
    try {
      setBusy("process");
      setProgress(15);
      setProgressLabel("Processando e indexando documentos…");
      const result = await processDocuments();
      setProgress(85);
      setProgressLabel("Sincronizando status…");
      await refresh();
      setProgress(100);
      toast.success(result.message);
    } catch (error) {
      toast.error(errorMessage(error, "Falha no processamento."));
      try {
        await refresh();
      } catch {
        /* ignore refresh errors after failure */
      }
    } finally {
      setBusy("idle");
      setProgress(0);
      setProgressLabel("");
    }
  }

  async function handleReindex() {
    try {
      setBusy("reindex");
      setProgress(15);
      setProgressLabel("Reconstruindo índice FAISS…");
      const result = await reindexDocuments();
      setProgress(85);
      setProgressLabel("Sincronizando status…");
      await refresh();
      setProgress(100);
      toast.success(result.message);
    } catch (error) {
      toast.error(errorMessage(error, "Falha na reindexação."));
      try {
        await refresh();
      } catch {
        /* ignore refresh errors after failure */
      }
    } finally {
      setBusy("idle");
      setProgress(0);
      setProgressLabel("");
    }
  }

  const isBusy = busy !== "idle";
  const pendingCount = status?.uploaded ?? 0;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={ACCEPTED_DOCUMENT_TYPES}
        onChange={handleFilesSelected}
      />

      <KnowledgeBaseCard
        documents={documents}
        footer={
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-muted-foreground">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {status?.index_exists
                    ? "Índice FAISS pronto"
                    : "Índice ainda não criado"}
                </span>
                {status ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {status.indexed} indexado(s) · {pendingCount} pendente(s)
                    {status.failed > 0 ? ` · ${status.failed} falha(s)` : ""}
                  </span>
                ) : null}
              </p>
              {isBusy ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  {progressLabel || "Processando…"}
                </span>
              ) : null}
            </div>

            {isBusy ? (
              <div
                className="h-1.5 overflow-hidden rounded-full bg-border/70"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${Math.max(progress, 8)}%` }}
                />
              </div>
            ) : null}
          </div>
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="border-border/60"
              disabled={isBusy}
              onClick={handleSelectFiles}
            >
              {busy === "upload" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Selecionar Arquivos
            </Button>
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => void handleProcess()}
            >
              {busy === "process" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Processar
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isBusy}
              onClick={() => void handleReindex()}
            >
              {busy === "reindex" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Reindexar
            </Button>
          </>
        }
      />
    </>
  );
}
