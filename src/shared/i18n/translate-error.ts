import type { AppError } from "@/shared/domain/app-error";

import type { Dictionary } from "./dictionaries";

type ErrorKey = keyof Dictionary["errors"];

/**
 * Traduce un AppError al idioma activo.
 *
 * - Errores de validación -> mensaje del motivo (t.validation.required, t.validation.positive...).
 * - Resto de errores      -> mensaje del código (t.errors.SKU_TAKEN...).
 * - Código desconocido    -> mensaje genérico.
 */
export function translateError(t: Dictionary, error: AppError | null | undefined): string {
  if (!error) return t.errors.UNKNOWN;

  if (error.code === "VALIDATION_ERROR" && error.reason) {
    return t.validation[error.reason];
  }

  if (error.code in t.errors) {
    return t.errors[error.code as ErrorKey];
  }

  return t.errors.UNKNOWN;
}
