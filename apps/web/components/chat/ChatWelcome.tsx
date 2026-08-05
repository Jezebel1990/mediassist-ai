import { ChatAgentAvatar } from "./ChatAgentAvatar";
import { ChatSuggestionCard } from "./ChatSuggestionCard";
import { CHAT_SUGGESTIONS } from "./constants";

type ChatWelcomeProps = {
  onSelectSuggestion: (question: string) => void;
  disabled?: boolean;
};

export function ChatWelcome({
  onSelectSuggestion,
  disabled = false,
}: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-6 text-center sm:py-10">
      <ChatAgentAvatar size={168} className="mb-6 sm:mb-8" />

      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Olá!
        </h2>
        <p className="text-base font-medium text-foreground">
          Eu sou o MediAssist AI.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Posso ajudar você a encontrar rapidamente informações presentes na
          documentação oficial da clínica.
        </p>
        <p className="text-sm font-medium text-foreground/80">
          Faça uma pergunta para começar.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {CHAT_SUGGESTIONS.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelectSuggestion}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
