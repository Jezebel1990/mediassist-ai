import Image from "next/image";

import { cn } from "@/lib/utils";

type ChatAgentAvatarProps = {
  className?: string;
  size?: number;
};

export function ChatAgentAvatar({
  className,
  size = 180,
}: ChatAgentAvatarProps) {
  return (
    <div
      className={cn("chat-agent-float relative mx-auto", className)}
      style={{ width: size, height: size }}
    >
      <div className="chat-agent-shadow absolute inset-x-[18%] bottom-[6%] h-3 rounded-[100%] bg-foreground/10 blur-[2px]" />
      <Image
        src="/chatbot.png"
        alt="MediAssist AI — agente virtual"
        width={size}
        height={size}
        priority
        className="relative z-10 h-full w-full object-contain select-none"
        draggable={false}
      />
    </div>
  );
}
