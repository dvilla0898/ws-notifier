import type { Product } from "@/modules/products/domain/product.entity";

/** Puerto de "listar productos". */
export interface ListProductsRepository {
  findAll(): Promise<Product[]>;
}
