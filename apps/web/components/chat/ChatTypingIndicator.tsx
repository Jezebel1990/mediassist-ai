import { cn } from "@/lib/utils";

type ChatTypingIndicatorProps = {
  className?: string;
};

export function ChatTypingIndicator({ className }: ChatTypingIndicatorProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-md">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
          <span className="sr-only">MediAssist AI está pensando</span>
          <span className="flex items-center gap-1" aria-hidden>
            <span className="chat-typing-dot size-1.5 rounded-full bg-primary" />
            <span className="chat-typing-dot size-1.5 rounded-full bg-primary [animation-delay:160ms]" />
            <span className="chat-typing-dot size-1.5 rounded-full bg-primary [animation-delay:320ms]" />
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
