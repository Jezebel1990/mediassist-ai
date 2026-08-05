import type { LucideIcon } from "lucide-react";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DocumentStatus } from "./types";

const statusConfig: Record<
  DocumentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: LucideIcon;
  }
> = {
  indexado: {
    label: "Indexado",
    variant: "default",
    icon: CircleCheck,
  },
  processando: {
    label: "Processando",
    variant: "secondary",
    icon: RefreshCw,
  },
  pendente: {
    label: "Pendente",
    variant: "outline",
    icon: Clock,
  },
  falhou: {
    label: "Falhou",
    variant: "destructive",
    icon: CircleAlert,
  },
};

type DocumentStatusBadgeProps = {
  status: DocumentStatus;
  className?: string;
};

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("w-fit gap-1.5", className)}>
      <StatusIcon className="size-3" strokeWidth={2} />
      {config.label}
    </Badge>
  );
}
