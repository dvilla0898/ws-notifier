import type { CreateProductRepository } from "@/modules/products/application/use-cases/create-product/create-product.port";
import type { DeleteProductRepository } from "@/modules/products/application/use-cases/delete-product/delete-product.port";
import type { GetProductRepository } from "@/modules/products/application/use-cases/get-product/get-product.port";
import type { ListProductsRepository } from "@/modules/products/application/use-cases/list-products/list-products.port";
import type { SearchProductsRepository } from "@/modules/products/application/use-cases/search-products/search-products.port";
import type { UpdateProductRepository } from "@/modules/products/application/use-cases/update-product/update-product.port";
import { Product, type ProductPrimitives } from "@/modules/products/domain/product.entity";
import type { Sku } from "@/modules/products/domain/value-objects/sku";
import { LocalStorageCollection } from "@/shared/infrastructure/local-storage-collection";

import productsSeed from "./seed/products.json";

/**
 * Adaptador ÚNICO del módulo: implementa los puertos de los 6 casos de uso.
 *
 * Todo el conocimiento de "cómo se guarda un producto" vive aquí. Si mañana hay
 * un backend real, se crea un `HttpProductRepository` con estos mismos métodos
 * y solo cambia una línea en products.container.ts.
 *
 * No espera ni simula latencia: eso lo hace `simulateApiCall` en el contenedor.
 */
export class LocalStorageProductRepository
  implements
    CreateProductRepository,
    UpdateProductRepository,
    DeleteProductRepository,
    GetProductRepository,
    ListProductsRepository,
    SearchProductsRepository
{
  private readonly collection = new LocalStorageCollection<ProductPrimitives>(
    "products",
    productsSeed,
  );

  nextId(): string {
    return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  async findAll(): Promise<Product[]> {
    return this.collection.read().map((record) => Product.restore(record));
  }

  async findById(id: string): Promise<Product | null> {
    const record = this.collection.read().find((item) => item.id === id);
    return record ? Product.restore(record) : null;
  }

  async existsBySku(sku: Sku, excludeId?: string): Promise<boolean> {
    return this.collection
      .read()
      .some((item) => item.sku === sku.value && item.id !== excludeId);
  }

  /** Inserta si el id no existe; si existe, lo reemplaza (upsert). */
  async save(product: Product): Promise<void> {
    const record = product.toPrimitives();
    const records = this.collection.read();
    const exists = records.some((item) => item.id === record.id);

    this.collection.write(
      exists ? records.map((item) => (item.id === record.id ? record : item)) : [...records, record],
    );
  }

  async delete(id: string): Promise<void> {
    this.collection.write(this.collection.read().filter((item) => item.id !== id));
  }
}
