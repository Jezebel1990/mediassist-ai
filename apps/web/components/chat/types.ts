export type ChatRole = "user" | "assistant";

export type ChatSourceRef = {
  document: string;
  /** Pages consulted for this document (deduplicated, sorted). */
  pages: number[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSourceRef[];
  /** Optional latency in milliseconds (assistant messages). */
  responseMs?: number;
  createdAt: string;
};

export type SuggestionPrompt = {
  id: string;
  label: string;
};
