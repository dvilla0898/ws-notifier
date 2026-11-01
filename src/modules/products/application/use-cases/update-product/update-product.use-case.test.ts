import { describe, expect, it } from "vitest";

import type { ProductInput } from "@/modules/products/application/product.dto";
import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { UpdateProductUseCase } from "./update-product.use-case";

const data: ProductInput = {
  name: "Wireless Mouse Pro",
  sku: "MOU-001",
  category: "Accessories",
  price: 24.99,
  stock: 3,
};

describe("UpdateProductUseCase", () => {
  it("actualiza el producto y conserva su fecha de creación", async () => {
    const repository = new InMemoryProductRepository(productsSeed);

    const result = await new UpdateProductUseCase(repository).execute({ id: "p1", data });

    expect(result).toMatchObject({
      ok: true,
      value: { id: "p1", name: "Wireless Mouse Pro", stock: 3, createdAt: productsSeed[0].createdAt },
    });
  });

  it("permite conservar su propio SKU, pero no usar el de otro producto", async () => {
    const useCase = new UpdateProductUseCase(new InMemoryProductRepository(productsSeed));

    expect((await useCase.execute({ id: "p1", data })).ok).toBe(true);
    expect(await useCase.execute({ id: "p1", data: { ...data, sku: "KEY-002" } })).toMatchObject({
      ok: false,
      error: { code: "SKU_TAKEN" },
    });
  });

  it("falla con PRODUCT_NOT_FOUND si el producto no existe", async () => {
    const useCase = new UpdateProductUseCase(new InMemoryProductRepository(productsSeed));

    expect(await useCase.execute({ id: "nope", data })).toMatchObject({
      ok: false,
      error: { code: "PRODUCT_NOT_FOUND" },
    });
  });
});
