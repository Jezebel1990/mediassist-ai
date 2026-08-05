import type { SuggestionPrompt } from "./types";

export const CHAT_SUGGESTIONS: SuggestionPrompt[] = [
  {
    id: "convenios",
    label: "Quais convênios são atendidos?",
  },
  {
    id: "remarcar",
    label: "Como remarcar uma consulta?",
  },
  {
    id: "colonoscopia",
    label: "Qual o preparo para colonoscopia?",
  },
  {
    id: "documentos",
    label: "Quais documentos o paciente deve apresentar?",
  },
];

/** Rotating status lines shown beside the loading assistant avatar. */
export const CHAT_LOADING_MESSAGES = [
  "Analisando a documentação...",
  "Consultando a Base de Conhecimento...",
  "Buscando a melhor resposta...",
  "Processando sua pergunta...",
] as const;

export const CHAT_FRIENDLY_ERROR =
  "Ocorreu um problema ao processar sua solicitação. Tente novamente em alguns instantes.";

export function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function pickLoadingMessage(exclude?: string): string {
  const pool = CHAT_LOADING_MESSAGES.filter((msg) => msg !== exclude);
  const choices = pool.length > 0 ? pool : [...CHAT_LOADING_MESSAGES];
  return choices[Math.floor(Math.random() * choices.length)] ?? choices[0];
}

/** Formats consulted pages as `Páginas: 3, 5 e 7` (or a single page). */
export function formatSourcePages(pages: number[]): string | null {
  if (pages.length === 0) {
    return null;
  }
  if (pages.length === 1) {
    return `Página ${pages[0]}`;
  }
  if (pages.length === 2) {
    return `Páginas: ${pages[0]} e ${pages[1]}`;
  }
  const head = pages.slice(0, -1).join(", ");
  const last = pages[pages.length - 1];
  return `Páginas: ${head} e ${last}`;
}
