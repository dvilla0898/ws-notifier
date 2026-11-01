import { AppError } from "@/shared/domain/app-error";

/** Errores de negocio del módulo de productos (un solo lugar para sus códigos). */
export const ProductErrors = {
  notFound: (id: string) => new AppError("PRODUCT_NOT_FOUND", `Product ${id} not found`),
  skuTaken: (sku: string) =>
    new AppError("SKU_TAKEN", `SKU ${sku} is already in use`, { field: "sku" }),
};
