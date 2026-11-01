import type { Product, ProductDraft, ProductPrimitives } from "@/modules/products/domain/product.entity";

/**
 * DTO (Data Transfer Object): lo que los casos de uso devuelven hacia afuera.
 *
 * La UI nunca recibe la entidad `Product` (con sus value objects y métodos):
 * recibe un objeto plano, fácil de mostrar y de guardar en un store.
 */
export type ProductDto = ProductPrimitives;

/** Datos de entrada para crear o editar un producto. */
export type ProductInput = ProductDraft;

export function toProductDto(product: Product): ProductDto {
  return product.toPrimitives();
}
