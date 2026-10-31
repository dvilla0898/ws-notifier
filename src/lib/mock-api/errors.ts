/**
 * Códigos de error que puede devolver la API simulada.
 * La UI no muestra el `message` (en inglés, para desarrolladores):
 * traduce el `code` con el diccionario de idiomas (ver src/i18n).
 */
export type ApiErrorCode = "INVALID_CREDENTIALS" | "NOT_FOUND" | "SKU_TAKEN" | "VALIDATION_ERROR";

export class ApiError extends Error {
  /** Código HTTP equivalente (401, 404, 409, 422...). */
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(message: string, status: number, code: ApiErrorCode) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Convierte cualquier error en un código que la UI sabe traducir. */
export function toErrorCode(error: unknown): string {
  return error instanceof ApiError ? error.code : "UNKNOWN";
}
