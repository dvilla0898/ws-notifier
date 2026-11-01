import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/config";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * Idioma actual de la interfaz, guardado en localStorage ("ws-notifier:locale").
 *
 * `skipHydration: true` evita leer localStorage en el primer render: así el HTML
 * estático (generado en inglés) coincide con lo que React pinta al hidratar.
 * La lectura real la hace <AppProviders> llamando a `persist.rehydrate()`.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "ws-notifier:locale",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
