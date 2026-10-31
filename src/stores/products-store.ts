import { create } from "zustand";

import { toErrorCode } from "@/lib/mock-api/errors";
import * as productsApi from "@/lib/mock-api/products-api";
import type { MutationResult, Product, ProductInput } from "@/types";

export type ProductsStatus = "idle" | "loading" | "success" | "error";

interface ProductsData {
  items: Product[];
  status: ProductsStatus;
  /** Error al cargar la lista (los errores de escritura se devuelven en MutationResult). */
  errorCode: string | null;
  /** Id del producto que se está eliminando, para mostrar un spinner en esa fila. */
  deletingId: string | null;
}

interface ProductsActions {
  fetchProducts: () => Promise<void>;
  createProduct: (input: ProductInput) => Promise<MutationResult>;
  updateProduct: (id: string, input: ProductInput) => Promise<MutationResult>;
  deleteProduct: (id: string) => Promise<MutationResult>;
}

export type ProductsState = ProductsData & ProductsActions;

export const initialProductsState: ProductsData = {
  items: [],
  status: "idle",
  errorCode: null,
  deletingId: null,
};

/**
 * Store de productos.
 *
 * No usa `persist`: la persistencia es responsabilidad de la API simulada
 * (como lo sería de un backend). El store es la "caché" en memoria que la UI lee.
 * Después de cada escritura exitosa, actualiza `items` sin volver a pedir la lista.
 */
export const useProductsStore = create<ProductsState>()((set) => ({
  ...initialProductsState,

  fetchProducts: async () => {
    set({ status: "loading", errorCode: null });
    try {
      const items = await productsApi.listProducts();
      set({ items, status: "success" });
    } catch (error) {
      set({ status: "error", errorCode: toErrorCode(error) });
    }
  },

  createProduct: async (input) => {
    try {
      const product = await productsApi.createProduct(input);
      set((state) => ({ items: [...state.items, product] }));
      return { ok: true };
    } catch (error) {
      return { ok: false, errorCode: toErrorCode(error) };
    }
  },

  updateProduct: async (id, input) => {
    try {
      const updated = await productsApi.updateProduct(id, input);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
      }));
      return { ok: true };
    } catch (error) {
      return { ok: false, errorCode: toErrorCode(error) };
    }
  },

  deleteProduct: async (id) => {
    set({ deletingId: id });
    try {
      await productsApi.deleteProduct(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        deletingId: null,
      }));
      return { ok: true };
    } catch (error) {
      set({ deletingId: null });
      return { ok: false, errorCode: toErrorCode(error) };
    }
  },
}));
