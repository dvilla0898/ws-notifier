import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/**
 * Value object: SKU (código único del producto).
 *
 * Reglas: de 3 a 20 caracteres (letras, números o guiones) y SIEMPRE en mayúsculas.
 * Como se normaliza al crearse, "mou-001" y "MOU-001" son el mismo SKU.
 */
export class Sku {
  static readonly PATTERN = /^[A-Z0-9-]{3,20}$/;

  private constructor(readonly value: string) {}

  static create(raw: string): Result<Sku> {
    const value = raw.trim().toUpperCase();
    if (!value) return fail(AppError.validation("sku", "required"));
    if (!Sku.PATTERN.test(value)) return fail(AppError.validation("sku", "invalidSku"));
    return ok(new Sku(value));
  }

  equals(other: Sku): boolean {
    return this.value === other.value;
  }
}
