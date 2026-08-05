"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  disabled?: boolean;
  className?: string;
};

const MAX_ROWS = 6;
const LINE_HEIGHT_PX = 20;
const BASE_PADDING_PX = 16;

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  className,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS + BASE_PADDING_PX;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-t border-border/60 bg-card/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/90 sm:px-4",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Faça uma pergunta sobre os documentos da clínica..."
          className="max-h-[140px] min-h-[44px] flex-1 resize-none overflow-y-auto py-2.5"
          aria-label="Mensagem para o assistente"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !value.trim()}
          className="size-11 shrink-0"
          aria-label="Enviar mensagem"
        >
          <SendHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </form>
  );
}
