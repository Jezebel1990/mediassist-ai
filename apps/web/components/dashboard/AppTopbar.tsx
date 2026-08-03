"use client";

import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { MobileSidebar } from "./MobileSidebar";
import { mockUser } from "./constants";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Bem-vindo ao MediAssist AI",
  },
  "/dashboard/chat": {
    title: "Chat IA",
    description: "Converse com o assistente inteligente",
  },
  "/dashboard/knowledge": {
    title: "Base de Conhecimento",
    description: "Gerencie os documentos do agente",
  },
};

export function AppTopbar() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta["/dashboard"];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {meta.title}
          </h1>
          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">{mockUser.name}</p>
          <p className="text-xs text-muted-foreground">{mockUser.email}</p>
        </div>

        <Avatar size="default" className="size-9 ring-2 ring-border/60">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {mockUser.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
