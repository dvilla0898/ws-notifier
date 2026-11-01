import { describe, expect, it } from "vitest";

import type { ProductInput } from "@/modules/products/application/product.dto";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { useProductsStore } from "../products.store";

const newProduct: ProductInput = {
  name: "Webcam HD",
  sku: "CAM-007",
  category: "Accessories",
  price: 49.9,
  stock: 10,
};

/** Integración: store -> contenedor -> caso de uso -> LocalStorageProductRepository. */
describe("products.store", () => {
  it("fetchProducts pasa de 'loading' a 'success' con el catálogo", async () => {
    const promise = useProductsStore.getState().fetchProducts();
    expect(useProductsStore.getState().status).toBe("loading");

    await promise;

    expect(useProductsStore.getState()).toMatchObject({ status: "success" });
    expect(useProductsStore.getState().items).toHaveLength(productsSeed.length);
  });

  it("createProduct agrega el producto sin volver a pedir la lista", async () => {
    await useProductsStore.getState().fetchProducts();

    const result = await useProductsStore.getState().createProduct(newProduct);

    expect(result.ok).toBe(true);
    expect(useProductsStore.getState().items.map((p) => p.sku)).toContain("CAM-007");
  });

  it("createProduct devuelve el AppError en lugar de lanzar una excepción", async () => {
    const result = await useProductsStore.getState().createProduct({ ...newProduct, sku: "MOU-001" });

    expect(result).toMatchObject({ ok: false, error: { code: "SKU_TAKEN" } });
  });

  it("searchProducts guarda los resultados y clearSearch los quita", async () => {
    await useProductsStore.getState().searchProducts("audio");
    expect(useProductsStore.getState().searchResults?.map((p) => p.name)).toEqual([
      "Noise-Cancelling Headphones",
    ]);

    useProductsStore.getState().clearSearch();
    expect(useProductsStore.getState().searchResults).toBeNull();
  });

  it("deleteProduct marca la fila mientras borra y luego la quita", async () => {
    await useProductsStore.getState().fetchProducts();

    const promise = useProductsStore.getState().deleteProduct("p3");
    expect(useProductsStore.getState().deletingId).toBe("p3");
    await promise;

    expect(useProductsStore.getState().deletingId).toBeNull();
    expect(useProductsStore.getState().items.some((p) => p.id === "p3")).toBe(false);
  });
});
