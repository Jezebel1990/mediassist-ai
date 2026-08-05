const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiDocumentStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "indexed"
  | "failed";

export type DocumentResponse = {
  id: string;
  original_filename: string;
  extension: string;
  content_type: string | null;
  file_size: number;
  status: ApiDocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
};

export type UploadResponse = {
  uploaded: DocumentResponse[];
  rejected: string[];
};

export type ProcessResponse = {
  processed: Array<{
    document_id: string;
    filename: string;
    status: ApiDocumentStatus;
    chunk_count: number;
    error_message?: string | null;
  }>;
  message: string;
};

export type ReindexResponse = {
  documents_indexed: number;
  total_chunks: number;
  message: string;
};

export type DocumentsListResponse = {
  documents: DocumentResponse[];
  total: number;
};

export type DocumentsStatusResponse = {
  total: number;
  uploaded: number;
  processing: number;
  processed: number;
  indexed: number;
  failed: number;
  total_chunks?: number;
  by_format?: Record<string, number>;
  index_exists: boolean;
  index_path: string;
  last_indexed_at: string | null;
  model_name: string;
};

export type DeleteDocumentResponse = {
  id: string;
  message: string;
};

export class DocumentsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DocumentsApiError";
    this.status = status;
  }
}

const TECHNICAL_ERROR_PATTERNS = [
  /bad request/i,
  /internal server error/i,
  /fetch failed/i,
  /network error/i,
  /typeerror/i,
  /cannot read/i,
  /unexpected error/i,
  /stack trace/i,
  /failed to fetch/i,
  /traceback/i,
];

function sanitizeErrorMessage(msg: string | null | undefined, fallback: string): string {
  if (!msg || typeof msg !== "string") return fallback;
  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(msg))) {
    return fallback;
  }
  return msg;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") {
    return sanitizeErrorMessage(detail, fallback);
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return sanitizeErrorMessage(String((item as { msg: unknown }).msg), fallback);
        }
        return null;
      })
      .filter((msg): msg is string => Boolean(msg) && msg !== fallback);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return fallback;
}

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new DocumentsApiError(
        extractErrorMessage(data, fallbackError),
        response.status,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof DocumentsApiError) {
      throw error;
    }
    throw new DocumentsApiError(fallbackError, 500);
  }
}

export async function listDocuments(): Promise<DocumentsListResponse> {
  return requestJson<DocumentsListResponse>(
    "/api/documents",
    { method: "GET" },
    "Não foi possível carregar os documentos.",
  );
}

export async function getDocumentsStatus(): Promise<DocumentsStatusResponse> {
  return requestJson<DocumentsStatusResponse>(
    "/api/documents/status",
    { method: "GET" },
    "Não foi possível carregar o status da base.",
  );
}

export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  return requestJson<UploadResponse>(
    "/api/documents/upload",
    { method: "POST", body: formData },
    "Não foi possível enviar os arquivos.",
  );
}

export async function processDocuments(
  documentIds: string[] = [],
): Promise<ProcessResponse> {
  return requestJson<ProcessResponse>(
    "/api/documents/process",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_ids: documentIds }),
    },
    "Não foi possível processar os documentos.",
  );
}

export async function reindexDocuments(): Promise<ReindexResponse> {
  return requestJson<ReindexResponse>(
    "/api/documents/reindex",
    { method: "POST" },
    "Não foi possível atualizar a base.",
  );
}

export async function updateDocument(
  documentId: string,
  name: string,
): Promise<DocumentResponse> {
  return requestJson<DocumentResponse>(
    `/api/documents/${documentId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
    "Erro ao atualizar.",
  );
}

export async function deleteDocument(
  documentId: string,
): Promise<DeleteDocumentResponse> {
  return requestJson<DeleteDocumentResponse>(
    `/api/documents/${documentId}`,
    { method: "DELETE" },
    "Erro ao excluir.",
  );
}
