/**
 * Error centralizado de la aplicación.
 *
 * - `code`: identifica el error en toda la app (la UI lo traduce con i18n).
 * - `field` y `reason`: solo en errores de validación, para marcar el campo exacto.
 *
 * Cada módulo crea sus errores con funciones de fábrica, por ejemplo
 * `ProductErrors.skuTaken()` o `AuthErrors.invalidCredentials()`,
 * para que los códigos no se escriban "a mano" por todo el código.
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "PRODUCT_NOT_FOUND"
  | "SKU_TAKEN"
  | "UNKNOWN";

/** Motivos de validación. Cada uno tiene su texto en src/shared/i18n/dictionaries. */
export type ValidationReason =
  | "required"
  | "minLength"
  | "invalidSku"
  | "positive"
  | "nonNegativeInteger";

interface AppErrorOptions {
  field?: string;
  reason?: ValidationReason;
  cause?: unknown;
}

export class AppError {
  readonly code: ErrorCode;
  /** Mensaje técnico en inglés, para desarrolladores (la UI no lo muestra). */
  readonly message: string;
  readonly field?: string;
  readonly reason?: ValidationReason;
  readonly cause?: unknown;

  constructor(code: ErrorCode, message: string, options: AppErrorOptions = {}) {
    this.code = code;
    this.message = message;
    this.field = options.field;
    this.reason = options.reason;
    this.cause = options.cause;
  }

  /** Error de validación de un campo concreto: AppError.validation("price", "positive"). */
  static validation(field: string, reason: ValidationReason): AppError {
    return new AppError("VALIDATION_ERROR", `Invalid ${field}: ${reason}`, { field, reason });
  }

  /** Error inesperado (una excepción que nadie previó). */
  static unexpected(cause?: unknown): AppError {
    return new AppError("UNKNOWN", "Unexpected error", { cause });
  }
}
