import { ok, type Result } from "@/shared/domain/result";

import { toProductDto, type ProductDto } from "../../product.dto";

import type { ListProductsRepository } from "./list-products.port";

/** Caso de uso (lectura): el sistema muestra el catálogo completo. */
export class ListProductsUseCase {
  constructor(private readonly repository: ListProductsRepository) {}

  async execute(): Promise<Result<ProductDto[]>> {
    const products = await this.repository.findAll();
    return ok(products.map(toProductDto));
  }
}
