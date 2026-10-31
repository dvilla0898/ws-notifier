import type { Product } from "@/modules/products/domain/product.entity";

/** Puerto de "buscar productos". */
export interface SearchProductsRepository {
  findAll(): Promise<Product[]>;
}
