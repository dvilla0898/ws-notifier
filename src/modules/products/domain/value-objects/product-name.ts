import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/**
 * Value object: nombre de un producto.
 *
 * Regla: al menos 2 caracteres, sin espacios al inicio o al final.
 * El constructor es privado: la ÚNICA forma de obtener un ProductName es
 * ProductName.create(), así que si existe uno, es válido.
 */
export class ProductName {
  static readonly MIN_LENGTH = 2;

  private constructor(readonly value: string) {}

  static create(raw: string): Result<ProductName> {
    const value = raw.trim();
    if (!value) return fail(AppError.validation("name", "required"));
    if (value.length < ProductName.MIN_LENGTH) return fail(AppError.validation("name", "minLength"));
    return ok(new ProductName(value));
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }
}
