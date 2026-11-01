"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { selectIsAuthenticated, useAuthStore } from "@/modules/auth/presentation/auth.store";
import { useTranslations } from "@/shared/i18n/use-translations";
import { LoadingState } from "@/shared/presentation/components/loading-state";

/**
 * Protege las rutas privadas (todo lo que está bajo /dashboard).
 *
 * Es una protección de experiencia de usuario, no de seguridad: con un backend real,
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
