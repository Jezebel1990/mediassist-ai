"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  DOCUMENT_FORMAT_FILTERS,
  type DocumentFormatFilter,
} from "./types";

type DocumentFilterProps = {
  value: DocumentFormatFilter;
  onChange: (value: DocumentFormatFilter) => void;
  className?: string;
};

export function DocumentFilter({
  value,
  onChange,
  className,
}: DocumentFilterProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className,
      )}
      role="group"
      aria-label="Filtrar por formato"
    >
      {DOCUMENT_FORMAT_FILTERS.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "h-8 rounded-md px-3 text-xs",
              !isActive && "border-border/60",
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
