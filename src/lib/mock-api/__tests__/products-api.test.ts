import { describe, expect, it } from "vitest";

import productsSeed from "@/data/products.json";
import type { ProductInput } from "@/types";

import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../products-api";
import { DB_PREFIX } from "../storage";

const validInput: ProductInput = {
  name: "Webcam HD",
  sku: "cam-007",
  category: "Accessories",
  price: 49.9,
  stock: 10,
};

/** Lee lo que la API guardó en localStorage (nuestra "base de datos"). */
function readStoredProducts(): { id: string; sku: string }[] {
  return JSON.parse(window.localStorage.getItem(`${DB_PREFIX}products`) ?? "[]");
}

/**
 * Tests de la API de productos.
 * Recuerda: antes de cada test, vitest.setup.ts limpia localStorage,
 * así que cada test empieza con los datos semilla de src/data/products.json.
 */
describe("products-api", () => {
  describe("listProducts", () => {
    it("la primera vez devuelve los datos semilla y los guarda en localStorage", async () => {
      const products = await listProducts();

      expect(products).toHaveLength(productsSeed.length);
      expect(readStoredProducts()).toHaveLength(productsSeed.length);
    });
  });

  describe("getProduct", () => {
    it("devuelve el producto por su id", async () => {
      await expect(getProduct("p1")).resolves.toMatchObject({ name: "Wireless Mouse" });
    });

    it("falla con NOT_FOUND si el id no existe", async () => {
      await expect(getProduct("nope")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    });
  });

  describe("createProduct", () => {
    it("crea el producto, normaliza el SKU y lo persiste", async () => {
      const created = await createProduct(validInput);

      expect(created.id).toBeTruthy();
      expect(created.sku).toBe("CAM-007"); // se guarda en mayúsculas
      expect(created.createdAt).toBe(created.updatedAt);

      // Persistencia: está en localStorage y lo devuelve una lectura posterior.
      expect(readStoredProducts().map((p) => p.sku)).toContain("CAM-007");
      await expect(listProducts()).resolves.toHaveLength(productsSeed.length + 1);
    });

    it("rechaza un SKU repetido (sin importar mayúsculas)", async () => {
      await expect(createProduct({ ...validInput, sku: "mou-001" })).rejects.toMatchObject({
        code: "SKU_TAKEN",
        status: 409,
      });
    });

    it("valida los datos aunque la UI ya lo haya hecho", async () => {
      await expect(createProduct({ ...validInput, price: -5 })).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("updateProduct", () => {
    it("actualiza los campos y la fecha de modificación", async () => {
      const updated = await updateProduct("p1", { ...validInput, sku: "MOU-001", stock: 3 });

      expect(updated).toMatchObject({ id: "p1", name: "Webcam HD", stock: 3 });
      expect(updated.updatedAt).not.toBe(productsSeed[0].updatedAt);
    });

    it("permite conservar su propio SKU, pero no usar el de otro producto", async () => {
      await expect(updateProduct("p1", { ...validInput, sku: "MOU-001" })).resolves.toBeDefined();
      await expect(updateProduct("p1", { ...validInput, sku: "KEY-002" })).rejects.toMatchObject({
        code: "SKU_TAKEN",
      });
    });

    it("falla con NOT_FOUND si el producto no existe", async () => {
      await expect(updateProduct("nope", validInput)).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("deleteProduct", () => {
    it("elimina el producto de la base de datos", async () => {
      await deleteProduct("p2");

      const ids = (await listProducts()).map((product) => product.id);
      expect(ids).not.toContain("p2");
      expect(ids).toHaveLength(productsSeed.length - 1);
    });

    it("falla con NOT_FOUND si el producto no existe", async () => {
      await expect(deleteProduct("nope")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });
});
