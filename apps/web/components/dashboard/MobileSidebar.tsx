"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AppSidebar } from "./AppSidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-border/60 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-64 gap-0 border-border/60 p-0 sm:max-w-64"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navegação</SheetTitle>
          <SheetDescription>
            Navegue pelas seções do MediAssist AI
          </SheetDescription>
        </SheetHeader>
        <AppSidebar
          className="w-full border-r-0"
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
