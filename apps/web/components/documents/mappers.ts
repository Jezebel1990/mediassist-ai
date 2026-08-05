import type { DocumentResponse } from "@/services/documents.service";

import {
  extensionToFormatKey,
  type DocumentStatus,
  type KnowledgeDocument,
} from "@/components/documents";
import type { ApiDocumentStatus } from "@/services/documents.service";

/** Brazil timezone used for all user-facing dates in the knowledge base. */
export const BRAZIL_TIMEZONE = "America/Sao_Paulo";

type FormatDocumentDateOptions = {
  /** When true, appends time as `DD/MM/YYYY às HH:mm`. */
  withTime?: boolean;
};

/**
 * Formats an ISO datetime for display in America/Sao_Paulo.
 *
 * - Date only: `03/08/2026`
 * - With time: `03/08/2026 às 14:35`
 */
export function formatDocumentDate(
  iso: string,
  options: FormatDocumentDateOptions = {},
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const datePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  if (!options.withTime) {
    return datePart;
  }

  const timePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} às ${timePart}`;
}

export function mapApiStatus(status: ApiDocumentStatus): DocumentStatus {
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

export function toKnowledgeDocument(doc: DocumentResponse): KnowledgeDocument {
  const formatKey = extensionToFormatKey(doc.extension);
  return {
    id: doc.id,
    name: doc.original_filename,
    status: mapApiStatus(doc.status),
    uploadedAt: formatDocumentDate(doc.created_at),
    type: formatKey.toUpperCase(),
    formatKey,
    extension: doc.extension.startsWith(".")
      ? doc.extension
      : `.${doc.extension}`,
    chunks: doc.chunk_count,
  };
}

export function documentsErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
