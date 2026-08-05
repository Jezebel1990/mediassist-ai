import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth";
import { DashboardShell } from "@/components/dashboard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

