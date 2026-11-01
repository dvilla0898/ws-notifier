import { describe, expect, it } from "vitest";

import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { GetProductUseCase } from "./get-product.use-case";

describe("GetProductUseCase", () => {
  const useCase = new GetProductUseCase(new InMemoryProductRepository(productsSeed));

  it("devuelve el producto como DTO plano", async () => {
    expect(await useCase.execute({ id: "p1" })).toEqual({ ok: true, value: productsSeed[0] });
  });

  it("falla con PRODUCT_NOT_FOUND si no existe", async () => {
    expect(await useCase.execute({ id: "nope" })).toMatchObject({
      ok: false,
      error: { code: "PRODUCT_NOT_FOUND" },
    });
  });
});
