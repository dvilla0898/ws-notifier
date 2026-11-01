import type { ReactNode } from "react";

import { Label } from "@/shared/presentation/ui/label";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  /** id del input: conecta <label htmlFor> y aria-describedby. */
  id: string;
  label: string;
  /** Mensaje de error ya traducido. */
  error?: string;
  hint?: string;
  className?: string;
  /** Recibe los ids de ayuda/error para ponerlos en aria-describedby del input. */
  children: (describedBy: string | undefined) => ReactNode;
}

/** Etiqueta + input + ayuda + error, con la accesibilidad resuelta en un solo lugar. */
export function FormField({ id, label, error, hint, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children(describedBy)}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
