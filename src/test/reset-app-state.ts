import { initialAuthState, useAuthStore } from "@/modules/auth/presentation/auth.store";
import {
  initialProductsState,
  useProductsStore,
} from "@/modules/products/presentation/products.store";
import { DEFAULT_LOCALE } from "@/shared/i18n/config";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { setApiDelay } from "@/shared/infrastructure/delay";

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

  // Sin latencia: los tests no esperan 1 s por llamada. simulated-api-call.test.ts prueba el segundo real.
  setApiDelay(0);
}
