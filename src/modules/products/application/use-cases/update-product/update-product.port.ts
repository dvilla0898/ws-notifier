import type { Product } from "@/modules/products/domain/product.entity";
import type { Sku } from "@/modules/products/domain/value-objects/sku";

/** Puerto de "editar producto". */
export interface UpdateProductRepository {
  findById(id: string): Promise<Product | null>;
  /** `excludeId`: permite que un producto conserve su propio SKU. */
  existsBySku(sku: Sku, excludeId?: string): Promise<boolean>;
  save(product: Product): Promise<void>;
}
