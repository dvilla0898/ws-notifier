import type { CreateProductRepository } from "@/modules/products/application/use-cases/create-product/create-product.port";
import type { DeleteProductRepository } from "@/modules/products/application/use-cases/delete-product/delete-product.port";
import type { GetProductRepository } from "@/modules/products/application/use-cases/get-product/get-product.port";
import type { ListProductsRepository } from "@/modules/products/application/use-cases/list-products/list-products.port";
import type { SearchProductsRepository } from "@/modules/products/application/use-cases/search-products/search-products.port";
import type { UpdateProductRepository } from "@/modules/products/application/use-cases/update-product/update-product.port";
import { Product, type ProductPrimitives } from "@/modules/products/domain/product.entity";
import type { Sku } from "@/modules/products/domain/value-objects/sku";

/**
 * Adaptador en memoria: mismos puertos, sin localStorage.
 *
 * Se usa en los tests de casos de uso: es rápido, no deja "basura" entre tests
 * y demuestra la idea central de la arquitectura hexagonal: el caso de uso
 * funciona igual con CUALQUIER adaptador que cumpla su puerto.
 */
export class InMemoryProductRepository
  implements
    CreateProductRepository,
    UpdateProductRepository,
    DeleteProductRepository,
    GetProductRepository,
    ListProductsRepository,
    SearchProductsRepository
{
  private readonly records = new Map<string, ProductPrimitives>();
  private sequence = 0;

  constructor(initial: ProductPrimitives[] = []) {
    initial.forEach((record) => this.records.set(record.id, { ...record }));
  }

  nextId(): string {
    this.sequence += 1;
    return `mem_${this.sequence}`;
  }

  async findAll(): Promise<Product[]> {
    return [...this.records.values()].map((record) => Product.restore(record));
  }

  async findById(id: string): Promise<Product | null> {
    const record = this.records.get(id);
    return record ? Product.restore(record) : null;
  }

  async existsBySku(sku: Sku, excludeId?: string): Promise<boolean> {
    return [...this.records.values()].some((r) => r.sku === sku.value && r.id !== excludeId);
  }

  async save(product: Product): Promise<void> {
    this.records.set(product.id, product.toPrimitives());
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  /** Ayuda para los tests: ver qué quedó guardado. */
  snapshot(): ProductPrimitives[] {
    return [...this.records.values()];
  }
}
