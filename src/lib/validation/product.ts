import type { ProductInput } from "@/types";

/**
 * Reglas de validación de un producto.
 *
 * Se usan en DOS lugares, igual que en una app real:
 *  - en el formulario, para avisar al usuario antes de enviar;
 *  - en la API simulada, que nunca debe confiar en lo que le llega.
 *
 * Devuelve códigos (no textos) para que la UI los traduzca.
 */
export type ProductField = keyof ProductInput;

export type ValidationErrorCode =
  | "required"
  | "minLength"
  | "invalidSku"
  | "positive"
  | "nonNegativeInteger";

export type ProductValidationErrors = Partial<Record<ProductField, ValidationErrorCode>>;

/** De 3 a 20 caracteres: letras, números o guiones. Ej.: "MOU-001". */
export const SKU_PATTERN = /^[A-Z0-9-]{3,20}$/i;

export function validateProduct(input: ProductInput): ProductValidationErrors {
  const errors: ProductValidationErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = "required";
  else if (name.length < 2) errors.name = "minLength";

  const sku = input.sku.trim();
  if (!sku) errors.sku = "required";
  else if (!SKU_PATTERN.test(sku)) errors.sku = "invalidSku";

  if (!input.category.trim()) errors.category = "required";

  // Number.isFinite descarta NaN e Infinity (por ejemplo, si el usuario escribió "abc").
  if (!Number.isFinite(input.price) || input.price <= 0) errors.price = "positive";

  if (!Number.isInteger(input.stock) || input.stock < 0) errors.stock = "nonNegativeInteger";

  return errors;
}

export function isValidProduct(errors: ProductValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
