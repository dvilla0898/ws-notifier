import { describe, expect, it } from "vitest";

import { Category } from "../value-objects/category";
import { Price } from "../value-objects/price";
import { ProductName } from "../value-objects/product-name";
import { Sku } from "../value-objects/sku";
import { Stock } from "../value-objects/stock";

/**
 * Los value objects son lo más fácil de probar: funciones puras, sin React ni red.
 * `it.each` ejecuta el mismo test con una tabla de casos.
 */
describe("value objects de productos", () => {
  describe("Sku", () => {
    it("normaliza a mayúsculas y quita espacios", () => {
      const sku = Sku.create("  mou-001 ");
      expect(sku.ok && sku.value.value).toBe("MOU-001");
    });

    it("dos SKU con distinta capitalización son iguales", () => {
      const a = Sku.create("mou-001");
      const b = Sku.create("MOU-001");
      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it.each([
      ["", "required"],
      ["AB", "invalidSku"],
      ["MOU 001", "invalidSku"],
      ["A".repeat(21), "invalidSku"],
    ])("rechaza %j con el motivo %s", (raw, reason) => {
      expect(Sku.create(raw)).toMatchObject({ ok: false, error: { field: "sku", reason } });
    });
  });

  describe("Price", () => {
    it("redondea a 2 decimales", () => {
      const price = Price.create(19.999);
      expect(price.ok && price.value.amount).toBe(20);
    });

    it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])("rechaza %s", (amount) => {
      expect(Price.create(amount)).toMatchObject({ ok: false, error: { reason: "positive" } });
    });
  });

  describe("Stock", () => {
    it("acepta 0 y sabe que está agotado", () => {
      const stock = Stock.create(0);
      expect(stock.ok && stock.value.isOutOfStock()).toBe(true);
    });

    it.each([-1, 1.5, Number.NaN])("rechaza %s", (units) => {
      expect(Stock.create(units)).toMatchObject({
        ok: false,
        error: { reason: "nonNegativeInteger" },
      });
    });
  });

  describe("ProductName", () => {
    it("quita espacios sobrantes", () => {
      const name = ProductName.create("  Mouse  ");
      expect(name.ok && name.value.value).toBe("Mouse");
    });

    it.each([
      ["   ", "required"],
      ["A", "minLength"],
    ])("rechaza %j con el motivo %s", (raw, reason) => {
      expect(ProductName.create(raw)).toMatchObject({ ok: false, error: { reason } });
    });
  });

  describe("Category", () => {
    it("es obligatoria", () => {
      expect(Category.create(" ")).toMatchObject({ ok: false, error: { reason: "required" } });
      expect(Category.create("Audio").ok).toBe(true);
    });
  });
});
