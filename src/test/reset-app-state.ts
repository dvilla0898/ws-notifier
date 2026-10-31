import { DEFAULT_LOCALE } from "@/i18n/config";
import { setApiDelay } from "@/lib/mock-api/delay";
import { initialAuthState, useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/locale-store";
import { initialProductsState, useProductsStore } from "@/stores/products-store";

/**
 * Deja la app "como recién instalada" antes de cada test.
 *
 * Los stores de Zustand son módulos globales: si un test inicia sesión y no
 * reseteamos, el siguiente test empezaría con sesión iniciada. Cada test debe
 * ser independiente y poder ejecutarse solo o en cualquier orden.
 */
export function resetAppState(): void {
  useAuthStore.setState(initialAuthState);
  useProductsStore.setState(initialProductsState);
  useLocaleStore.setState({ locale: DEFAULT_LOCALE });

  // Después de resetear los stores (persist escribe en localStorage al hacer setState).
  window.localStorage.clear();

  // Sin latencia: los tests no esperan 1 s por llamada. delay.test.ts prueba el segundo real.
  setApiDelay(0);
}
