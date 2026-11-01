import { Product } from "@/modules/products/domain/product.entity";
import { ProductErrors } from "@/modules/products/domain/product.errors";
import { fail, ok, type Result } from "@/shared/domain/result";

import { toProductDto, type ProductDto, type ProductInput } from "../../product.dto";

import type { CreateProductRepository } from "./create-product.port";

/**
 * Caso de uso: el usuario crea un producto.
 *
 * 1. El dominio valida los datos (value objects).
 * 2. Regla de negocio: el SKU no puede repetirse.
 * 3. Se guarda y se devuelve el DTO.
 */
export class CreateProductUseCase {
  constructor(private readonly repository: CreateProductRepository) {}

  async execute(input: ProductInput): Promise<Result<ProductDto>> {
    const created = Product.create(input, this.repository.nextId(), new Date());
    if (!created.ok) return created;
    const product = created.value;

    if (await this.repository.existsBySku(product.sku)) {
      return fail(ProductErrors.skuTaken(product.sku.value));
    }

    await this.repository.save(product);
    return ok(toProductDto(product));
  }
}
