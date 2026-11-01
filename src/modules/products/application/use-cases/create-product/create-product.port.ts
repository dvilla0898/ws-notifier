import type { Product } from "@/modules/products/domain/product.entity";
import type { Sku } from "@/modules/products/domain/value-objects/sku";

/**
 * Puerto de "crear producto": SOLO lo que este caso de uso necesita del almacenamiento.
 * El adaptador LocalStorageProductRepository lo implementa (junto con los demás puertos).
 */
export interface CreateProductRepository {
  nextId(): string;
  existsBySku(sku: Sku): Promise<boolean>;
  save(product: Product): Promise<void>;
}
