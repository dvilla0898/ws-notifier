import { describe, expect, it } from "vitest";

import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import { SearchProductsUseCase } from "./search-products.use-case";

describe("SearchProductsUseCase", () => {
  const useCase = new SearchProductsUseCase(new InMemoryProductRepository(productsSeed));

  async function namesFor(term: string) {
    const result = await useCase.execute({ term });
    return result.ok ? result.value.map((product) => product.name) : [];
  }

  it("busca por categoría", async () => {
    expect(await namesFor("audio")).toEqual(["Noise-Cancelling Headphones"]);
  });

  it("busca por SKU sin importar mayúsculas", async () => {
    expect(await namesFor("key-002")).toEqual(["Mechanical Keyboard"]);
  });

  it("un término vacío devuelve todo", async () => {
    expect(await namesFor("  ")).toHaveLength(productsSeed.length);
  });

  it("sin coincidencias devuelve una lista vacía (no es un error)", async () => {
    expect(await useCase.execute({ term: "zzz" })).toEqual({ ok: true, value: [] });
  });
});
