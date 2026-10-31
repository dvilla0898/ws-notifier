import { describe, expect, it, vi } from "vitest";

import type { ProductInput } from "@/modules/products/application/product.dto";
import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product.repository";
import productsSeed from "@/modules/products/infrastructure/seed/products.json";

import type { CreateProductRepository } from "./create-product.port";
import { CreateProductUseCase } from "./create-product.use-case";

const input: ProductInput = {
  name: "Webcam HD",
  sku: "cam-007",
  category: "Accessories",
  price: 49.9,
  stock: 10,
};

/**
 * Tests del caso de uso SIN localStorage, SIN React y SIN latencia.
 *
 * Dos estilos de "doble" (sustituto) del puerto:
 *  - InMemoryProductRepository: un adaptador real pero en memoria.
 *  - Un objeto fake escrito en el propio test: solo los 3 métodos del puerto.
 */
describe("CreateProductUseCase", () => {
  it("crea el producto, lo guarda y devuelve el DTO", async () => {
    const repository = new InMemoryProductRepository(productsSeed);

    const result = await new CreateProductUseCase(repository).execute(input);

    expect(result).toMatchObject({ ok: true, value: { name: "Webcam HD", sku: "CAM-007" } });
    expect(repository.snapshot()).toHaveLength(productsSeed.length + 1);
  });

  it("rechaza un SKU repetido (sin importar mayúsculas) y no guarda nada", async () => {
    const repository = new InMemoryProductRepository(productsSeed);

    const result = await new CreateProductUseCase(repository).execute({ ...input, sku: "mou-001" });

    expect(result).toMatchObject({ ok: false, error: { code: "SKU_TAKEN", field: "sku" } });
    expect(repository.snapshot()).toHaveLength(productsSeed.length);
  });

  it("devuelve el error de validación del dominio sin tocar el repositorio", async () => {
    const fake: CreateProductRepository = {
      nextId: () => "new-id",
      existsBySku: vi.fn(),
      save: vi.fn(),
    };

    const result = await new CreateProductUseCase(fake).execute({ ...input, price: 0 });

    expect(result).toMatchObject({ ok: false, error: { field: "price", reason: "positive" } });
    expect(fake.existsBySku).not.toHaveBeenCalled();
    expect(fake.save).not.toHaveBeenCalled();
  });
});
