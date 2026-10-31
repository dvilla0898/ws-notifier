"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import { DashboardShell } from "@/app-shell/dashboard-shell";

/**
 * Layout de todas las rutas /dashboard/*.
 * Primero verifica la sesión (AuthGuard) y luego dibuja el menú + cabecera.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
