import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/** Value object: nombre de usuario. Regla: obligatorio; se ignoran los espacios alrededor. */
export class Username {
  private constructor(readonly value: string) {}

  static create(raw: string): Result<Username> {
    const value = raw.trim();
    if (!value) return fail(AppError.validation("username", "required"));
    return ok(new Username(value));
  }
}
