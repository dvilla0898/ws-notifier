import type { Dictionary } from "./dictionaries";

type ErrorKey = keyof Dictionary["errors"];

/** Traduce un código de error de la API; si no lo conoce, usa el mensaje genérico. */
export function translateError(t: Dictionary, code: string | null | undefined): string {
  if (code && code in t.errors) {
    return t.errors[code as ErrorKey];
  }
  return t.errors.UNKNOWN;
}
