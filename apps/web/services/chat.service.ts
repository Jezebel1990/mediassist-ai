const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ChatSource = {
  document: string;
  pages: number[];
};

export type ChatRequest = {
  question: string;
};

export type ChatResponse = {
  success: boolean;
  answer: string;
  sources: ChatSource[];
};

export class ChatApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatApiError";
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

/**
 * Sends a question to the MediAssist chat endpoint (RAG + OpenRouter).
 *
 * Designed as a single-turn ask so streaming / session IDs can be added later
 * without changing callers that already work with ChatResponse.
 */
export async function askQuestion(question: string): Promise<ChatResponse> {
  const fallback =
    "Ocorreu um problema ao processar sua solicitação. Tente novamente em alguns instantes.";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question } satisfies ChatRequest),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new ChatApiError(
        extractErrorMessage(data, fallback),
        response.status,
      );
    }

    const payload = data as Partial<ChatResponse> | null;
    return {
      success: payload?.success ?? true,
      answer: payload?.answer ?? "",
      sources: Array.isArray(payload?.sources) ? payload.sources : [],
    };
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    throw new ChatApiError(fallback, 500);
  }
}
