import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface LoadingRegionProps {
  /** Lo que escucha un lector de pantalla, p. ej. "Loading products...". */
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * Envoltorio accesible de cualquier skeleton.
 *
 * Los bloques grises son solo visuales (aria-hidden). Esta región anuncia
 * el estado con role="status" y un texto oculto, y marca aria-busy.
 */
export function LoadingRegion({ label, className, children }: LoadingRegionProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn(className)}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
