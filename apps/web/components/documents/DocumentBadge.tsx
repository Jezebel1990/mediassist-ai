import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formatBadgeLabel } from "./types";

type DocumentBadgeProps = {
  formatKey: string;
  extension?: string;
  className?: string;
};

export function DocumentBadge({
  formatKey,
  extension,
  className,
}: DocumentBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium tracking-wide", className)}
    >
      {formatBadgeLabel(formatKey, extension)}
    </Badge>
  );
}
