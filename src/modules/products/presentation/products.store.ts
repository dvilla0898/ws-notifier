import { create } from "zustand";

import type { ProductDto, ProductInput } from "@/modules/products/application/product.dto";
import { productsContainer } from "@/modules/products/products.container";
import type { AppError } from "@/shared/domain/app-error";
import type { Result } from "@/shared/domain/result";

export type ProductsStatus = "idle" | "loading" | "success" | "error";

interface ProductsData {
  /** Catálogo completo (caso de uso list-products). */
  items: ProductDto[];
  status: ProductsStatus;
  error: AppError | null;
  /** Resultados de búsqueda; null = no hay búsqueda activa. */
  searchResults: ProductDto[] | null;
  searchTerm: string;
  isSearching: boolean;
  /** Id del producto que se está eliminando (spinner en esa fila). */
  deletingId: string | null;
}

interface ProductsActions {
  fetchProducts: () => Promise<void>;
  searchProducts: (term: string) => Promise<void>;
  clearSearch: () => void;
  getProduct: (id: string) => Promise<Result<ProductDto>>;
  createProduct: (input: ProductInput) => Promise<Result<ProductDto>>;
  updateProduct: (id: string, input: ProductInput) => Promise<Result<ProductDto>>;
  deleteProduct: (id: string) => Promise<Result<void>>;
}

export type ProductsState = ProductsData & ProductsActions;

export const initialProductsState: ProductsData = {
  items: [],
  status: "idle",
  error: null,
  searchResults: null,
  searchTerm: "",
  isSearching: false,
  deletingId: null,
};

const replaceIn = (list: ProductDto[] | null, product: ProductDto) =>
  list?.map((item) => (item.id === product.id ? product : item)) ?? null;

const removeFrom = (list: ProductDto[] | null, id: string) =>
  list?.filter((item) => item.id !== id) ?? null;

/**
 * Store de productos (capa de presentación): estado de pantalla.
 *
 * Cada acción llama a UN caso de uso del contenedor y traduce el Result
 * a estado (cargando, lista, error). No hay reglas de negocio aquí.
 */
export const useProductsStore = create<ProductsState>()((set, get) => ({
  ...initialProductsState,

  fetchProducts: async () => {
    set({ status: "loading", error: null });
    const result = await productsContainer.listProducts.execute();
    if (result.ok) set({ items: result.value, status: "success" });
    else set({ status: "error", error: result.error });
  },

  searchProducts: async (term) => {
    set({ searchTerm: term, isSearching: true });
    const result = await productsContainer.searchProducts.execute({ term });
    // Si mientras tanto el usuario escribió otra cosa, ignoramos esta respuesta vieja.
    if (get().searchTerm !== term) return;
    set({ searchResults: result.ok ? result.value : [], isSearching: false });
  },

  clearSearch: () => set({ searchTerm: "", searchResults: null, isSearching: false }),

  getProduct: (id) => productsContainer.getProduct.execute({ id }),

  createProduct: async (input) => {
    const result = await productsContainer.createProduct.execute(input);
    if (result.ok) set((state) => ({ items: [...state.items, result.value] }));
    return result;
  },

  updateProduct: async (id, input) => {
    const result = await productsContainer.updateProduct.execute({ id, data: input });
    if (result.ok) {
      set((state) => ({
        items: replaceIn(state.items, result.value) ?? [],
        searchResults: replaceIn(state.searchResults, result.value),
      }));
    }
    return result;
  },

  deleteProduct: async (id) => {
    set({ deletingId: id });
    const result = await productsContainer.deleteProduct.execute({ id });
    if (result.ok) {
      set((state) => ({
        items: removeFrom(state.items, id) ?? [],
        searchResults: removeFrom(state.searchResults, id),
        deletingId: null,
      }));
    } else {
      set({ deletingId: null });
    }
    return result;
  },
}));
