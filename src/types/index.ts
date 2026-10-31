/** Usuario autenticado (nunca incluye la contraseña). */
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  /** Fechas en formato ISO 8601. */
  createdAt: string;
  updatedAt: string;
}

/** Datos que el usuario puede editar al crear o actualizar un producto. */
export type ProductInput = Pick<Product, "name" | "sku" | "category" | "price" | "stock">;

/**
 * Resultado de una operación de escritura (crear, editar, eliminar).
 * En lugar de lanzar excepciones hacia la UI, el store devuelve un objeto
 * que el componente puede inspeccionar con un simple `if (result.ok)`.
 */
export type MutationResult = { ok: true } | { ok: false; errorCode: string };
