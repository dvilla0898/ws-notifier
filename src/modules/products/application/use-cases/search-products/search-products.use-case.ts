import { ok, type Result } from "@/shared/domain/result";

import { toProductDto, type ProductDto } from "../../product.dto";

import type { SearchProductsRepository } from "./search-products.port";

export interface SearchProductsQuery {
  term: string;
}

/**
 * Caso de uso (lectura): el usuario busca productos.
 * La regla de "qué coincide" vive en el dominio (`Product.matches`), no aquí.
 */
export class SearchProductsUseCase {
  constructor(private readonly repository: SearchProductsRepository) {}

  async execute({ term }: SearchProductsQuery): Promise<Result<ProductDto[]>> {
    const products = await this.repository.findAll();
    return ok(products.filter((product) => product.matches(term)).map(toProductDto));
  }
}
