"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/feedback/loading-state";
import { useTranslations } from "@/i18n/use-translations";
import { selectIsAuthenticated, useAuthStore } from "@/stores/auth-store";

/**
 * Protege las rutas privadas (todo lo que está bajo /dashboard).
 *
 * Como el sitio es estático, no hay middleware de servidor: la protección
 * ocurre en el navegador. Si no hay token, redirige a /login.
 * Ojo: esto es una protección de UX, no de seguridad; con un backend real,
 * la API también debe validar el token en cada petición.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <LoadingState label={t.common.loading} fullScreen />;
  }

  return <>{children}</>;
}
