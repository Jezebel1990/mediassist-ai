import type { ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:shrink-0">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="hidden md:block lg:hidden">
          <AppSidebar collapsed />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border/60 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            MediAssist AI — Consulta inteligente a documentos internos da
            clínica
          </p>
        </footer>
      </div>
    </div>
  );
}
