import { Card, CardContent, CardHeader } from "@/shared/presentation/ui/card";
import { Skeleton } from "@/shared/presentation/ui/skeleton";

import { LoadingRegion } from "./loading-region";

interface TableSkeletonProps {
  label: string;
  /** Filas (o tarjetas en móvil) de relleno. */
  rows?: number;
  /** Columnas de la tabla en escritorio. */
  columns?: number;
  /** Muestra el bloque del buscador arriba. */
  withToolbar?: boolean;
}

/**
 * Skeleton de un listado. Imita la MISMA forma que la vista real para que,
 * al llegar los datos, nada "salte" en la pantalla:
 *  - móvil y tablet (< lg): tarjetas apiladas;
 *  - escritorio (≥ lg): encabezado + filas de tabla.
 */
export function TableSkeleton({ label, rows = 5, columns = 6, withToolbar = true }: TableSkeletonProps) {
  const rowList = Array.from({ length: rows }, (_, index) => index);
  const columnList = Array.from({ length: columns }, (_, index) => index);
  const grid = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  return (
    <LoadingRegion label={label}>
      <Card>
        {withToolbar && (
          <CardHeader className="px-4 sm:px-6">
            <Skeleton className="h-10 w-full max-w-sm md:h-9" />
          </CardHeader>
        )}
        <CardContent className="px-4 sm:px-6">
          <div data-testid="skeleton-cards" className="space-y-3 lg:hidden">
            {rowList.map((row) => (
              <div key={row} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>

          <div data-testid="skeleton-table" className="hidden space-y-4 lg:block">
            <div className="grid gap-4 border-b pb-3" style={grid}>
              {columnList.map((column) => (
                <Skeleton key={column} className="h-4 w-3/4" />
              ))}
            </div>
            {rowList.map((row) => (
              <div key={row} className="grid items-center gap-4" style={grid}>
                {columnList.map((column) => (
                  <Skeleton key={column} className="h-5" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </LoadingRegion>
  );
}
