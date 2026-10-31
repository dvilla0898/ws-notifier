import { describe, expect, it } from "vitest";

import type { ProductInput } from "@/types";

import { isValidProduct, validateProduct } from "../product";

const valid: ProductInput = {
  name: "Wireless Mouse",
  sku: "MOU-001",
  category: "Accessories",
  price: 19.99,
  stock: 0,
};

/**
 * Las funciones puras (sin React, sin red) son las más fáciles de probar:
 * mismo input -> mismo output. `it.each` ejecuta el mismo test con varios casos.
 */
describe("validateProduct", () => {
  it("no devuelve errores para un producto válido (stock 0 es válido)", () => {
    const errors = validateProduct(valid);

    expect(errors).toEqual({});
    expect(isValidProduct(errors)).toBe(true);
  });

  it.each([
    ["nombre vacío", { name: "  " }, "name", "required"],
    ["nombre de 1 letra", { name: "A" }, "name", "minLength"],
    ["SKU vacío", { sku: "" }, "sku", "required"],
    ["SKU con espacios", { sku: "MOU 001" }, "sku", "invalidSku"],
    ["SKU muy corto", { sku: "AB" }, "sku", "invalidSku"],
    ["categoría vacía", { category: "" }, "category", "required"],
    ["precio 0", { price: 0 }, "price", "positive"],
    ["precio no numérico", { price: Number.NaN }, "price", "positive"],
    ["stock negativo", { stock: -1 }, "stock", "nonNegativeInteger"],
    ["stock con decimales", { stock: 1.5 }, "stock", "nonNegativeInteger"],
  ] as const)("%s -> %s: %s", (_case, override, field, expectedCode) => {
    const errors = validateProduct({ ...valid, ...override });

    expect(errors[field]).toBe(expectedCode);
    expect(isValidProduct(errors)).toBe(false);
  });
});
