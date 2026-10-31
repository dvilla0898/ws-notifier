import { describe, expect, it } from "vitest";

import { Product, type ProductDraft } from "../product.entity";

const draft: ProductDraft = {
  name: "Webcam HD",
  sku: "cam-007",
  category: "Accessories",
  price: 49.9,
  stock: 10,
};
const now = new Date("2026-05-01T10:00:00.000Z");

describe("Product (entidad)", () => {
  it("se crea con datos válidos y los normaliza", () => {
    const result = Product.create(draft, "p1", now);

    expect(result.ok && result.value.toPrimitives()).toEqual({
      id: "p1",
      name: "Webcam HD",
      sku: "CAM-007",
      category: "Accessories",
      price: 49.9,
      stock: 10,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it("no se crea si un value object rechaza su dato (devuelve el primer error)", () => {
    const result = Product.create({ ...draft, sku: "a b", price: -1 }, "p1", now);

    expect(result).toMatchObject({ ok: false, error: { field: "sku", reason: "invalidSku" } });
  });

  it("update() devuelve un producto NUEVO y conserva id y createdAt", () => {
    const original = Product.create(draft, "p1", now);
    if (!original.ok) throw new Error("setup");
    const later = new Date("2026-06-01T10:00:00.000Z");

    const updated = original.value.update({ ...draft, stock: 3 }, later);

    expect(updated.ok && updated.value.toPrimitives()).toMatchObject({
      id: "p1",
      stock: 3,
      createdAt: now.toISOString(),
      updatedAt: later.toISOString(),
    });
    expect(original.value.stock.units).toBe(10); // el original no cambió (inmutable)
  });

  it("matches() busca por nombre, SKU o categoría sin importar mayúsculas", () => {
    const result = Product.create(draft, "p1", now);
    if (!result.ok) throw new Error("setup");
    const product = result.value;

    expect(product.matches("webcam")).toBe(true);
    expect(product.matches("cam-0")).toBe(true);
    expect(product.matches("ACCESS")).toBe(true);
    expect(product.matches("audio")).toBe(false);
  });

  it("restore() lanza un error si el registro guardado está corrupto", () => {
    expect(() =>
      Product.restore({ ...draft, id: "x", price: -1, createdAt: "", updatedAt: "" }),
    ).toThrow(/Corrupted product record x/);
  });
});
