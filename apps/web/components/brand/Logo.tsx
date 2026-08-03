import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeStyles = {
  default: {
    root: "gap-3",
    iconBox: "h-12 w-12 rounded-xl",
    icon: "h-7 w-7",
    text: "text-2xl",
  },
  sm: {
    root: "gap-2.5",
    iconBox: "h-9 w-9 rounded-lg",
    icon: "h-5 w-5",
    text: "text-lg",
  },
  compact: {
    root: "justify-center",
    iconBox: "h-9 w-9 rounded-lg",
    icon: "h-5 w-5",
    text: "sr-only",
  },
} as const;

type LogoProps = {
  className?: string;
  size?: keyof typeof sizeStyles;
};

export function Logo({ className, size = "default" }: LogoProps) {
  const styles = sizeStyles[size];
  const showWordmark = size !== "compact";

  return (
    <div className={cn("flex items-center", styles.root, className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-blue-600 shadow-sm",
          styles.iconBox,
        )}
      >
        <Activity
          className={cn("text-white", styles.icon)}
          strokeWidth={2.5}
        />
      </div>

      <span
        className={cn(
          "font-semibold text-gray-800",
          styles.text,
          !showWordmark && "sr-only",
        )}
      >
        MediAssist AI
      </span>
    </div>
  );
}
