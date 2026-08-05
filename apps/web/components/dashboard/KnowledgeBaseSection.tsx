"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  ACCEPTED_DOCUMENT_TYPES,
  DocumentActions,
  documentsErrorMessage,
  toKnowledgeDocument,
  type KnowledgeDocument,
} from "@/components/documents";
import { Button } from "@/components/ui/button";
import {
  DocumentsApiError,
  deleteDocument,
  getDocumentsStatus,
  listDocuments,
  processDocuments,
  reindexDocuments,
  updateDocument,
  uploadDocuments,
  type DocumentsStatusResponse,
} from "@/services/documents.service";

import { KnowledgeBaseCard } from "./KnowledgeBaseCard";

type BusyAction = "idle" | "upload" | "process" | "reindex" | "loading";

type KnowledgeBaseSectionProps = {
  onStatusChange?: (status: DocumentsStatusResponse | null) => void;
};

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
          toast.error(
            documentsErrorMessage(error, "Falha ao carregar a base."),
          );
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
        toast.success("Documento enviado com sucesso.");
      }
      if (result.rejected.length > 0) {
        toast.error(result.rejected.join("\n"));
      }
    } catch (error) {
      toast.error(documentsErrorMessage(error, "Falha no upload."));
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
      toast.error(documentsErrorMessage(error, "Falha no processamento."));
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

  async function handleUpdate() {
    try {
      setBusy("reindex");
      setProgress(15);
      setProgressLabel("Atualizando Base de Conhecimento…");
      const result = await reindexDocuments();
      setProgress(85);
      setProgressLabel("Sincronizando status…");
      await refresh();
      setProgress(100);
      toast.success(result.message);
    } catch (error) {
      toast.error(documentsErrorMessage(error, "Erro ao atualizar."));
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

  async function handleRename(documentId: string, name: string) {
    try {
      await updateDocument(documentId, name);
      await refresh();
      toast.success("Documento atualizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof DocumentsApiError
          ? error.message
          : "Erro ao atualizar.";
      toast.error(message);
      throw error;
    }
  }

  async function handleDelete(documentId: string) {
    try {
      await deleteDocument(documentId);
      toast.success("Documento excluído com sucesso.");
    } catch {
      toast.error("Não foi possível excluir o documento. Tente novamente.");
      return;
    }

    try {
      await refresh();
    } catch {
      /* ignore refresh error after successful deletion */
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
        emptyDescription="Selecione arquivos para começar a indexação."
        footer={
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-muted-foreground">
                Condição operacional:{" "}
                <span className="font-medium text-foreground">
                  {status?.index_exists
                    ? "Operacional e pronta"
                    : "Pendente"}
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
              onClick={() => void handleUpdate()}
            >
              {busy === "reindex" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Atualizar
            </Button>
          </>
        }
        renderActions={(document) => (
          <DocumentActions
            document={document}
            disabled={isBusy}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        )}
      />
    </>
  );
}
