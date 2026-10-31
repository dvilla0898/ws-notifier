"use client";

import { useLocaleStore } from "@/stores/locale-store";

import { dictionaries, type Dictionary } from "./dictionaries";

/**
 * Hook de traducciones.
 *
 *   const t = useTranslations();
 *   <h1>{t.products.title}</h1>
 *
 * Al cambiar el idioma en el store, todos los componentes que usan este hook
 * se vuelven a renderizar con el diccionario nuevo.
 */
export function useTranslations(): Dictionary {
  const locale = useLocaleStore((state) => state.locale);
  return dictionaries[locale];
}
