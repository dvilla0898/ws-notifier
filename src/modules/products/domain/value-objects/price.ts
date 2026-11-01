import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/**
 * Value object: precio.
 *
 * Reglas: número mayor que 0, guardado siempre con 2 decimales.
 * Si una función recibe un Price, no necesita volver a validar nada.
 */
export class Price {
  private constructor(readonly amount: number) {}

  static create(amount: number): Result<Price> {
    // Number.isFinite descarta NaN e Infinity (por ejemplo, si llegó texto convertido).
    if (!Number.isFinite(amount) || amount <= 0) {
      return fail(AppError.validation("price", "positive"));
    }
    return ok(new Price(Math.round(amount * 100) / 100));
  }

  equals(other: Price): boolean {
    return this.amount === other.amount;
  }
}
