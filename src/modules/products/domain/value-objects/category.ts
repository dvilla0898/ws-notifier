import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

/** Value object: categoría del producto. Regla: obligatoria. */
export class Category {
  private constructor(readonly value: string) {}

  static create(raw: string): Result<Category> {
    const value = raw.trim();
    if (!value) return fail(AppError.validation("category", "required"));
    return ok(new Category(value));
  }

  equals(other: Category): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
