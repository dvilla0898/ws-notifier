import { describe, expect, it } from "vitest";

import productsSeed from "@/data/products.json";
import type { ProductInput } from "@/types";

import { useProductsStore } from "../products-store";

const newProduct: ProductInput = {
  name: "Webcam HD",
  sku: "CAM-007",
  category: "Accessories",
  price: 49.9,
  stock: 10,
};

describe("products-store", () => {
  it("fetchProducts: pasa de 'loading' a 'success' con la lista", async () => {
    const promise = useProductsStore.getState().fetchProducts();
    expect(useProductsStore.getState().status).toBe("loading");

    await promise;

    const state = useProductsStore.getState();
    expect(state.status).toBe("success");
    expect(state.items).toHaveLength(productsSeed.length);
  });

  it("createProduct: agrega el producto a la lista sin volver a pedirla", async () => {
    await useProductsStore.getState().fetchProducts();

    const result = await useProductsStore.getState().createProduct(newProduct);

    expect(result).toEqual({ ok: true });
    expect(useProductsStore.getState().items.map((p) => p.sku)).toContain("CAM-007");
  });

  it("createProduct: devuelve el código de error en lugar de lanzar una excepción", async () => {
    const result = await useProductsStore.getState().createProduct({ ...newProduct, sku: "MOU-001" });

    expect(result).toEqual({ ok: false, errorCode: "SKU_TAKEN" });
  });

  it("updateProduct: reemplaza el producto editado en la lista", async () => {
    await useProductsStore.getState().fetchProducts();

    await useProductsStore.getState().updateProduct("p1", { ...newProduct, sku: "MOU-001" });

    const edited = useProductsStore.getState().items.find((p) => p.id === "p1");
    expect(edited?.name).toBe("Webcam HD");
  });

  it("deleteProduct: marca la fila mientras borra y luego la quita", async () => {
    await useProductsStore.getState().fetchProducts();

    const promise = useProductsStore.getState().deleteProduct("p3");
    expect(useProductsStore.getState().deletingId).toBe("p3");

    const result = await promise;

    expect(result).toEqual({ ok: true });
    const state = useProductsStore.getState();
    expect(state.deletingId).toBeNull();
    expect(state.items.some((p) => p.id === "p3")).toBe(false);
  });
});
