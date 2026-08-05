import type { LucideIcon } from "lucide-react";
import {
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";

export type DocumentStatus =
  | "indexado"
  | "processando"
  | "pendente"
  | "falhou";

export type DocumentFormatFilter =
  | "all"
  | "pdf"
  | "docx"
  | "csv"
  | "markdown"
  | "html"
  | "json"
  | "xlsx"
  | "pptx";

export type KnowledgeDocument = {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedAt: string;
  type: string;
  formatKey: DocumentFormatFilter | string;
  extension: string;
  chunks: number;
};

export const DOCUMENT_FORMAT_FILTERS: Array<{
  value: DocumentFormatFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "csv", label: "CSV" },
  { value: "markdown", label: "Markdown" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "xlsx", label: "XLSX" },
  { value: "pptx", label: "PPTX" },
];

export const FORMAT_DISPLAY_ORDER = [
  "pdf",
  "docx",
  "csv",
  "markdown",
  "html",
  "json",
  "xlsx",
  "pptx",
] as const;

export const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  csv: "CSV",
  markdown: "Markdown",
  html: "HTML",
  json: "JSON",
  xlsx: "XLSX",
  pptx: "PPTX",
  md: "MD",
};

export function extensionToFormatKey(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, "");
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "htm" || ext === "html") return "html";
  return ext || "file";
}

export function formatBadgeLabel(formatKey: string, extension?: string): string {
  if (formatKey === "markdown") return "MD";
  if (FORMAT_LABELS[formatKey]) return FORMAT_LABELS[formatKey];
  const ext = (extension ?? formatKey).replace(/^\./, "").toUpperCase();
  return ext || "FILE";
}

export function getDocumentIcon(formatKey: string): LucideIcon {
  switch (formatKey) {
    case "pdf":
    case "docx":
    case "pptx":
      return FileText;
    case "csv":
    case "xlsx":
      return FileSpreadsheet;
    case "json":
      return FileJson;
    case "html":
    case "markdown":
      return FileCode2;
    default:
      return FileType;
  }
}

export const ACCEPTED_DOCUMENT_TYPES = [
  ".pdf",
  ".csv",
  ".docx",
  ".xlsx",
  ".pptx",
  ".json",
  ".html",
  ".htm",
  ".md",
  ".markdown",
].join(",");
