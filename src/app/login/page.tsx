"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/modules/auth/presentation/components/login-form";
import { selectIsAuthenticated, useAuthStore } from "@/modules/auth/presentation/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // Si ya hay sesión (por ejemplo, recargaste /login), vamos directo al panel.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </main>
  );
}
