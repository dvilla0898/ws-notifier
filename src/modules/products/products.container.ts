import { CreateProductUseCase } from "@/modules/products/application/use-cases/create-product/create-product.use-case";
import { DeleteProductUseCase } from "@/modules/products/application/use-cases/delete-product/delete-product.use-case";
import { GetProductUseCase } from "@/modules/products/application/use-cases/get-product/get-product.use-case";
import { ListProductsUseCase } from "@/modules/products/application/use-cases/list-products/list-products.use-case";
import { SearchProductsUseCase } from "@/modules/products/application/use-cases/search-products/search-products.use-case";
import { UpdateProductUseCase } from "@/modules/products/application/use-cases/update-product/update-product.use-case";
import { LocalStorageProductRepository } from "@/modules/products/infrastructure/local-storage-product.repository";
import { simulateApiCall } from "@/shared/infrastructure/simulated-api-call";

/**
 * Contenedor del módulo de productos (raíz de composición).
 *
 * Es el ÚNICO lugar que decide qué adaptador usa cada caso de uso.
 * ¿Bug de "se usa el almacenamiento equivocado" o "falta la latencia"? Es aquí.
 *
 * Cada caso de uso se envuelve en `simulateApiCall`: 1 s de espera
 * y cualquier excepción inesperada se convierte en un Result con error.
 */
const repository = new LocalStorageProductRepository();

export const productsContainer = {
  listProducts: simulateApiCall(new ListProductsUseCase(repository)),
  searchProducts: simulateApiCall(new SearchProductsUseCase(repository)),
  getProduct: simulateApiCall(new GetProductUseCase(repository)),
  createProduct: simulateApiCall(new CreateProductUseCase(repository)),
  updateProduct: simulateApiCall(new UpdateProductUseCase(repository)),
  deleteProduct: simulateApiCall(new DeleteProductUseCase(repository)),
};
