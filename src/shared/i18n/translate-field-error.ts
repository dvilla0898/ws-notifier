import type { Dictionary } from "./dictionaries";

/**
 * Traduce el `type` de un error de react-hook-form.
 * Puede ser un motivo de validación ("required", "positive"...) o un código de error
 * ("SKU_TAKEN", "INVALID_CREDENTIALS"...). Ver shared/presentation/forms/to-field-error.ts.
 */
export function translateFieldError(
  t: Dictionary,
  error: { type?: string | number } | undefined,
): string | undefined {
  if (!error?.type) return undefined;
  const type = String(error.type);

  if (type in t.validation) return t.validation[type as keyof Dictionary["validation"]];
  if (type in t.errors) return t.errors[type as keyof Dictionary["errors"]];
  return t.errors.UNKNOWN;
}
