import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "gap-4 border-border/60 shadow-md transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <div className="space-y-1">
          <CardDescription className="text-sm font-medium">
            {title}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {value}
          </CardTitle>
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </CardHeader>

      {description ? (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
