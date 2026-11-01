import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/**
 * Value object: unidades en inventario.
 *
 * Regla: número entero de 0 o más.
 * Además de validar, el value object "sabe" responder preguntas del negocio.
 */
export class Stock {
  private constructor(readonly units: number) {}

  static create(units: number): Result<Stock> {
    if (!Number.isInteger(units) || units < 0) {
      return fail(AppError.validation("stock", "nonNegativeInteger"));
    }
    return ok(new Stock(units));
  }

  isOutOfStock(): boolean {
    return this.units === 0;
  }

  equals(other: Stock): boolean {
    return this.units === other.units;
  }
}
