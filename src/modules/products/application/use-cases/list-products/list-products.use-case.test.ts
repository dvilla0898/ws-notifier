import { describe, expect, it } from "vitest";

import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { ListProductsUseCase } from "./list-products.use-case";

describe("ListProductsUseCase", () => {
  it("devuelve todo el catálogo", async () => {
    const useCase = new ListProductsUseCase(new InMemoryProductRepository(productsSeed));

    expect(await useCase.execute()).toEqual({ ok: true, value: productsSeed });
  });

  it("devuelve una lista vacía si no hay productos", async () => {
    const useCase = new ListProductsUseCase(new InMemoryProductRepository());

    expect(await useCase.execute()).toEqual({ ok: true, value: [] });
  });
});
