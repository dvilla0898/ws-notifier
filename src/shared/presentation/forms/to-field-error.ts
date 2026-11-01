import type { FieldError } from "react-hook-form";

import type { AppError } from "@/shared/domain/app-error";

/**
 * Convierte un AppError del dominio en un error de react-hook-form.
 *
 * Guardamos en `type` el motivo (p. ej. "required") o el código (p. ej. "SKU_TAKEN"),
 * NO el texto: así el mensaje se traduce al renderizar y cambia si el usuario
 * cambia de idioma con el formulario abierto.
 */
export function toFieldError(error: AppError): FieldError {
  return { type: error.reason ?? error.code, message: error.message };
}
