import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-md", className)}>
      <CardContent className="space-y-6 pt-6">{children}</CardContent>
    </Card>
  );
}
