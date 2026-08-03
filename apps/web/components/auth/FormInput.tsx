import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormInputProps = {
  label: string;
  error?: string;
  containerClassName?: string;
} & React.ComponentProps<"input">;

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, containerClassName, className, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          className={className}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
