import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/**
 * Value object: contraseña ingresada.
 * Regla: obligatoria. No se recortan espacios: forman parte de la contraseña.
 */
export class Password {
  private constructor(readonly value: string) {}

  static create(raw: string): Result<Password> {
    if (raw.length === 0) return fail(AppError.validation("password", "required"));
    return ok(new Password(raw));
  }
}
