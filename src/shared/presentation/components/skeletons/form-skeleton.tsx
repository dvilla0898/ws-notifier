import { Card, CardContent } from "@/shared/presentation/ui/card";
import { Skeleton } from "@/shared/presentation/ui/skeleton";

import { LoadingRegion } from "./loading-region";

interface FormSkeletonProps {
  label: string;
  /** Cantidad de campos (etiqueta + input). */
  fields?: number;
}

/**
 * Skeleton de un formulario: misma rejilla (1 columna en móvil, 2 desde `sm`;
 * el primer campo ocupa todo el ancho) y la misma fila de botones.
 */
export function FormSkeleton({ label, fields = 5 }: FormSkeletonProps) {
  return (
    <LoadingRegion label={label}>
      <Card>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: fields }, (_, index) => (
              <div
                key={index}
                data-testid="skeleton-field"
                className={index === 0 ? "space-y-2 sm:col-span-2" : "space-y-2"}
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full md:h-9" />
              </div>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Skeleton className="h-10 w-full sm:w-24 md:h-9" />
            <Skeleton className="h-10 w-full sm:w-24 md:h-9" />
          </div>
        </CardContent>
      </Card>
    </LoadingRegion>
  );
}
