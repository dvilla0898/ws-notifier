"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/feedback/loading-state";
import { useTranslations } from "@/i18n/use-translations";
import { selectIsAuthenticated, useAuthStore } from "@/stores/auth-store";

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
