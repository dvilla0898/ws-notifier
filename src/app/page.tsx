"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/shared/presentation/components/loading-state";
import { useTranslations } from "@/shared/i18n/use-translations";
import { selectIsAuthenticated, useAuthStore } from "@/modules/auth/presentation/auth.store";

/** Ruta "/": solo decide a dónde ir según haya sesión o no. */
export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, router]);

  return <LoadingState label={t.common.loading} fullScreen />;
}
