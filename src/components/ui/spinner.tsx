import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Icono giratorio decorativo. El texto accesible lo pone quien lo usa. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cn("size-4 animate-spin", className)} />;
}
