/**
 * Skeletons reutilizables. Para una pantalla nueva:
 *  - listados  -> <TableSkeleton label={t...} columns={n} />
 *  - formularios -> <FormSkeleton label={t...} fields={n} />
 *  - algo distinto -> compón <Skeleton /> dentro de <LoadingRegion label=... />
 */
export { FormSkeleton } from "./form-skeleton";
export { LoadingRegion } from "./loading-region";
export { TableSkeleton } from "./table-skeleton";
