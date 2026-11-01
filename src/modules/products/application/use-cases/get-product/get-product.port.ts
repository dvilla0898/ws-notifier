import type { Product } from "@/modules/products/domain/product.entity";

/** Puerto de "obtener un producto". */
export interface GetProductRepository {
  findById(id: string): Promise<Product | null>;
}
