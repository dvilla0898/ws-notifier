import productsSeed from "@/data/products.json";
import { isValidProduct, validateProduct } from "@/lib/validation/product";
import type { Product, ProductInput } from "@/types";

import { delay } from "./delay";
import { ApiError } from "./errors";
import { readCollection, writeCollection } from "./storage";

/**
 * API simulada de productos. Cada función equivale a un endpoint REST:
 *
 *   listProducts()        -> GET    /products
 *   getProduct(id)        -> GET    /products/:id
 *   createProduct(input)  -> POST   /products
 *   updateProduct(id, in) -> PUT    /products/:id
 *   deleteProduct(id)     -> DELETE /products/:id
 *
 * Si mañana existe un backend real, solo hay que reemplazar el cuerpo de estas
 * funciones por llamadas `fetch`; los stores y componentes no cambian.
 */
const COLLECTION = "products";
const seed: Product[] = productsSeed;

function loadProducts(): Product[] {
  return readCollection<Product>(COLLECTION, seed);
}

/** Limpia los datos como lo haría un backend: espacios, SKU en mayúsculas, 2 decimales. */
function normalize(input: ProductInput): ProductInput {
  return {
    name: input.name.trim(),
    sku: input.sku.trim().toUpperCase(),
    category: input.category.trim(),
    price: Math.round(input.price * 100) / 100,
    stock: input.stock,
  };
}

function assertValid(input: ProductInput): void {
  if (!isValidProduct(validateProduct(input))) {
    throw new ApiError("Invalid product data", 422, "VALIDATION_ERROR");
  }
}

function assertUniqueSku(products: Product[], sku: string, ignoreId?: string): void {
  if (products.some((product) => product.sku === sku && product.id !== ignoreId)) {
    throw new ApiError(`SKU ${sku} is already in use`, 409, "SKU_TAKEN");
  }
}

function notFound(id: string): ApiError {
  return new ApiError(`Product ${id} not found`, 404, "NOT_FOUND");
}

function generateId(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProducts(): Promise<Product[]> {
  await delay();
  return loadProducts();
}

export async function getProduct(id: string): Promise<Product> {
  await delay();
  const product = loadProducts().find((item) => item.id === id);
  if (!product) throw notFound(id);
  return product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await delay();

  const data = normalize(input);
  assertValid(data);

  const products = loadProducts();
  assertUniqueSku(products, data.sku);

  const now = new Date().toISOString();
  const product: Product = { id: generateId(), ...data, createdAt: now, updatedAt: now };

  writeCollection(COLLECTION, [...products, product]);
  return product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  await delay();

  const products = loadProducts();
  const current = products.find((item) => item.id === id);
  if (!current) throw notFound(id);

  const data = normalize(input);
  assertValid(data);
  assertUniqueSku(products, data.sku, id);

  const updated: Product = { ...current, ...data, updatedAt: new Date().toISOString() };

  writeCollection(
    COLLECTION,
    products.map((item) => (item.id === id ? updated : item)),
  );
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();

  const products = loadProducts();
  if (!products.some((item) => item.id === id)) throw notFound(id);

  writeCollection(
    COLLECTION,
    products.filter((item) => item.id !== id),
  );
}
