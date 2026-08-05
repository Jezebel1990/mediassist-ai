"use client";

import { useEffect, useState } from "react";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { KnowledgeDocument } from "./types";

type DocumentActionsProps = {
  document: KnowledgeDocument;
  disabled?: boolean;
  onRename: (documentId: string, name: string) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
};

function splitFilename(filename: string): { stem: string; extension: string } {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) {
    return { stem: filename, extension: "" };
  }
  return {
    stem: filename.slice(0, lastDot),
    extension: filename.slice(lastDot),
  };
}

export function DocumentActions({
  document,
  disabled = false,
  onRename,
  onDelete,
}: DocumentActionsProps) {
  const { stem, extension } = splitFilename(document.name);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [nameValue, setNameValue] = useState(stem);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (renameOpen) {
      setNameValue(stem);
    }
  }, [renameOpen, stem]);

  async function handleRename() {
    const nextName = nameValue.trim();
    if (!nextName || nextName === stem) {
      setRenameOpen(false);
      return;
    }

    try {
      setIsRenaming(true);
      await onRename(document.id, nextName);
      setRenameOpen(false);
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await onDelete(document.id);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={disabled || isRenaming || isDeleting}
            aria-label={`Ações de ${document.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => setRenameOpen(true)}
            disabled={disabled}
          >
            <Pencil className="size-4" />
            Editar nome
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
            disabled={disabled}
          >
            <Trash2 className="size-4" />
            Excluir documento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
            <DialogDescription>
              Altere apenas o nome do arquivo. A extensão permanece fixa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`rename-${document.id}`}>Nome do documento</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`rename-${document.id}`}
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                disabled={isRenaming}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleRename();
                  }
                }}
              />
              {extension ? (
                <span className="shrink-0 rounded-md border border-border/60 bg-muted/40 px-2.5 py-2 text-sm text-muted-foreground">
                  {extension}
                </span>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isRenaming}
              onClick={() => setRenameOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isRenaming || !nameValue.trim()}
              onClick={() => void handleRename()}
            >
              {isRenaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja realmente excluir este documento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o arquivo e seus embeddings da Base de
              Conhecimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Excluir Documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
