import { ProductErrors } from "@/modules/products/domain/product.errors";
import { fail, ok, type Result } from "@/shared/domain/result";

import type { DeleteProductRepository } from "./delete-product.port";

export interface DeleteProductCommand {
  id: string;
}

/** Caso de uso: el usuario elimina un producto. */
export class DeleteProductUseCase {
  constructor(private readonly repository: DeleteProductRepository) {}

  async execute({ id }: DeleteProductCommand): Promise<Result<void>> {
    const product = await this.repository.findById(id);
    if (!product) return fail(ProductErrors.notFound(id));

    await this.repository.delete(id);
    return ok();
  }
}
