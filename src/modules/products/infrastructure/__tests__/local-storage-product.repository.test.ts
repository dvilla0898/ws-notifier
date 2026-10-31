import { describe, expect, it } from "vitest";

import { Product } from "@/modules/products/domain/product.entity";
import { Sku } from "@/modules/products/domain/value-objects/sku";
import { DB_PREFIX } from "@/shared/infrastructure/local-storage-collection";

import { LocalStorageProductRepository } from "../local-storage-product.repository";
import productsSeed from "../seed/products.json";

const KEY = `${DB_PREFIX}products`;
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as { id: string }[];

function sku(value: string): Sku {
  const result = Sku.create(value);
  if (!result.ok) throw new Error("setup");
  return result.value;
}

/**
 * Test del ADAPTADOR: aquí sí probamos localStorage (los casos de uso no lo conocen).
 * vitest.setup.ts limpia localStorage antes de cada test.
 */
describe("LocalStorageProductRepository", () => {
  it("la primera lectura inicializa localStorage con los datos semilla", async () => {
    const repository = new LocalStorageProductRepository();

    const products = await repository.findAll();

    expect(products).toHaveLength(productsSeed.length);
    expect(stored()).toHaveLength(productsSeed.length);
  });

  it("save() inserta un producto nuevo y lo persiste", async () => {
    const repository = new LocalStorageProductRepository();
    const created = Product.create(
      { name: "Webcam HD", sku: "CAM-007", category: "Accessories", price: 49.9, stock: 10 },
      repository.nextId(),
      new Date(),
    );
    if (!created.ok) throw new Error("setup");

    await repository.save(created.value);

    // Otra instancia (como tras recargar la página) lo encuentra.
    expect(await new LocalStorageProductRepository().findById(created.value.id)).not.toBeNull();
  });

  it("save() reemplaza un producto existente (upsert)", async () => {
    const repository = new LocalStorageProductRepository();
    const current = await repository.findById("p1");
    if (!current) throw new Error("setup");
    const updated = current.update({ ...current.toPrimitives(), stock: 1 }, new Date());
    if (!updated.ok) throw new Error("setup");

    await repository.save(updated.value);

    expect(stored()).toHaveLength(productsSeed.length);
    expect((await repository.findById("p1"))?.stock.units).toBe(1);
  });

  it("existsBySku() permite excluir al propio producto", async () => {
    const repository = new LocalStorageProductRepository();

    expect(await repository.existsBySku(sku("MOU-001"))).toBe(true);
    expect(await repository.existsBySku(sku("MOU-001"), "p1")).toBe(false);
  });

  it("delete() quita el producto", async () => {
    const repository = new LocalStorageProductRepository();

    await repository.delete("p2");

    expect(stored().map((item) => item.id)).not.toContain("p2");
  });
});
