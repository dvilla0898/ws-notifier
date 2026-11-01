import { ProductErrors } from "@/modules/products/domain/product.errors";
import { fail, ok, type Result } from "@/shared/domain/result";

import { toProductDto, type ProductDto } from "../../product.dto";

import type { GetProductRepository } from "./get-product.port";

export interface GetProductQuery {
  id: string;
}

/**
 * Caso de uso (lectura): el sistema carga un producto para editarlo.
 * Las lecturas son deliberadamente delgadas: no hay reglas de negocio que aplicar.
 */
export class GetProductUseCase {
  constructor(private readonly repository: GetProductRepository) {}

  async execute({ id }: GetProductQuery): Promise<Result<ProductDto>> {
    const product = await this.repository.findById(id);
    if (!product) return fail(ProductErrors.notFound(id));
    return ok(toProductDto(product));
  }
}
