import { ProductErrors } from "@/modules/products/domain/product.errors";
import { fail, ok, type Result } from "@/shared/domain/result";

import { toProductDto, type ProductDto, type ProductInput } from "../../product.dto";

import type { UpdateProductRepository } from "./update-product.port";

export interface UpdateProductCommand {
  id: string;
  data: ProductInput;
}

/** Caso de uso: el usuario edita un producto existente. */
export class UpdateProductUseCase {
  constructor(private readonly repository: UpdateProductRepository) {}

  async execute({ id, data }: UpdateProductCommand): Promise<Result<ProductDto>> {
    const current = await this.repository.findById(id);
    if (!current) return fail(ProductErrors.notFound(id));

    const updated = current.update(data, new Date());
    if (!updated.ok) return updated;
    const product = updated.value;

    if (await this.repository.existsBySku(product.sku, id)) {
      return fail(ProductErrors.skuTaken(product.sku.value));
    }

    await this.repository.save(product);
    return ok(toProductDto(product));
  }
}
