import { cn } from "@/lib/utils";

type ChatUserMessageProps = {
  content: string;
  className?: string;
};

export function ChatUserMessage({ content, className }: ChatUserMessageProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm sm:max-w-[75%]">
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
