import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"button">, "type" | "children">;

export function SubmitButton({
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={cn("h-11 w-full text-sm font-semibold", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </Button>
  );
}
