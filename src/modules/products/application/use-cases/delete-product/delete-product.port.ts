import type { Product } from "@/modules/products/domain/product.entity";

/** Puerto de "eliminar producto". */
export interface DeleteProductRepository {
  findById(id: string): Promise<Product | null>;
  delete(id: string): Promise<void>;
}
