import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
