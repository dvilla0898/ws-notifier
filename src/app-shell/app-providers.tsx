"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useAuthStore } from "@/modules/auth/presentation/auth.store";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { LoadingState } from "@/shared/presentation/components/loading-state";

/**
 * Se monta una sola vez en el layout raíz (src/app/layout.tsx).
 *
 * 1. Recupera la sesión guardada con el caso de uso get-current-session
 *    y el idioma elegido (store persistido).
 *    Se hace en un useEffect para que solo ocurra en el navegador, nunca en el build.
 * 2. Mientras tanto muestra un loader, así ninguna página decide "no hay sesión"
 *    antes de haber leído localStorage.
 * 3. Mantiene sincronizado el atributo <html lang> con el idioma elegido.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    void Promise.all([
      useAuthStore.getState().restoreSession(),
      useLocaleStore.persist.rehydrate(),
    ]).then(() => setReady(true));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (!ready) {
    return <LoadingState label="Loading..." fullScreen />;
  }

  return <>{children}</>;
}
