import type { FieldErrors, Resolver } from "react-hook-form";

import type { ProductInput } from "@/modules/products/application/product.dto";
import { Category } from "@/modules/products/domain/value-objects/category";
import { Price } from "@/modules/products/domain/value-objects/price";
import { ProductName } from "@/modules/products/domain/value-objects/product-name";
import { Sku } from "@/modules/products/domain/value-objects/sku";
import { Stock } from "@/modules/products/domain/value-objects/stock";
import { AppError } from "@/shared/domain/app-error";
import type { Result } from "@/shared/domain/result";
import { toFieldError } from "@/shared/presentation/forms/to-field-error";

/** En el formulario todo es texto (lo que escribe el usuario). */
export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
}

export type ProductFormField = keyof ProductFormValues;

export const PRODUCT_FORM_FIELDS: ProductFormField[] = ["name", "sku", "category", "price", "stock"];

/** "19,99" o "19.99" -> 19.99. Texto que no es número -> NaN (el dominio lo rechaza). */
export function parseNumber(value: string): number {
  return Number(value.trim().replace(",", "."));
}

/**
 * Cada campo se valida con SU value object del dominio.
 * Si mañana cambia la regla del SKU, se cambia en sku.ts y el formulario la aplica solo.
 */
const fieldRules: Record<ProductFormField, (raw: string) => Result<unknown>> = {
  name: (raw) => ProductName.create(raw),
  sku: (raw) => Sku.create(raw),
  category: (raw) => Category.create(raw),
  price: (raw) => Price.create(parseNumber(raw)),
  stock: (raw) => Stock.create(parseNumber(raw)),
};

/** Valida UN campo: vacío -> "required"; si no, lo que diga el dominio. */
export function validateProductField(field: ProductFormField, raw: string): AppError | null {
  if (raw.trim() === "") return AppError.validation(field, "required");
  const result = fieldRules[field](raw);
  return result.ok ? null : result.error;
}

export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name,
    sku: values.sku,
    category: values.category,
    price: parseNumber(values.price),
    stock: parseNumber(values.stock),
  };
}

export function toProductFormValues(input?: ProductInput): ProductFormValues {
  return {
    name: input?.name ?? "",
    sku: input?.sku ?? "",
    category: input?.category ?? "",
    price: input ? String(input.price) : "",
    stock: input ? String(input.stock) : "",
  };
}

/** Resolver de react-hook-form: reúne los errores de todos los campos. */
export const productFormResolver: Resolver<ProductFormValues> = async (values) => {
  const errors: FieldErrors<ProductFormValues> = {};

  PRODUCT_FORM_FIELDS.forEach((field) => {
    const error = validateProductField(field, values[field]);
    if (error) errors[field] = toFieldError(error);
  });

  return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
};
