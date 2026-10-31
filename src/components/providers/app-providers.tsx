"use client";

import { useEffect, useState, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/locale-store";

/**
 * Se monta una sola vez en el layout raíz.
 *
 * 1. Rehidrata los stores persistidos (sesión e idioma) desde localStorage.
 *    Se hace en un useEffect para que solo ocurra en el navegador, nunca en el build.
 * 2. Mientras tanto muestra un loader, así ninguna página decide "no hay sesión"
 *    antes de haber leído localStorage.
 * 3. Mantiene sincronizado el atributo <html lang> con el idioma elegido.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    void Promise.all([useAuthStore.persist.rehydrate(), useLocaleStore.persist.rehydrate()]).then(
      () => setHydrated(true),
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (!hydrated) {
    return <LoadingState label="Loading..." fullScreen />;
  }

  return <>{children}</>;
}
