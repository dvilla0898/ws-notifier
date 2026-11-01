import { describe, expect, it } from "vitest";

import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { DeleteProductUseCase } from "./delete-product.use-case";

describe("DeleteProductUseCase", () => {
  it("elimina el producto", async () => {
    const repository = new InMemoryProductRepository(productsSeed);

    const result = await new DeleteProductUseCase(repository).execute({ id: "p2" });

    expect(result).toEqual({ ok: true, value: undefined });
    expect(repository.snapshot().map((p) => p.id)).not.toContain("p2");
  });

  it("falla con PRODUCT_NOT_FOUND si no existe", async () => {
    const useCase = new DeleteProductUseCase(new InMemoryProductRepository(productsSeed));

    expect(await useCase.execute({ id: "nope" })).toMatchObject({
      ok: false,
      error: { code: "PRODUCT_NOT_FOUND" },
    });
  });
});
