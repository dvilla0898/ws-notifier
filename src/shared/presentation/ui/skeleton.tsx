import * as React from "react";

import { cn } from "@/shared/lib/utils";

/**
 * Bloque base de shadcn/ui: un rectángulo gris con "pulso" suave.
 *
 * - `motion-safe:` solo anima si el usuario NO pidió reducir el movimiento
 *   en su sistema operativo (prefers-reduced-motion).
 * - `aria-hidden`: es decoración. El texto para lectores de pantalla lo pone
 *   <LoadingRegion> (ver shared/presentation/components/skeletons).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-md bg-muted-foreground/15 motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
