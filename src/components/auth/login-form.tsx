"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { translateError } from "@/i18n/translate-error";
import { useTranslations } from "@/i18n/use-translations";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Formulario de login.
 *
 * - Valida que ambos campos tengan algo antes de llamar a la API.
 * - Mientras espera (1 s simulado) deshabilita los campos y muestra "Signing in...".
 * - Si la API responde error, muestra el mensaje traducido en un role="alert".
 * - Si todo sale bien, redirige al panel.
 */
export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const errorCode = useAuthStore((state) => state.errorCode);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [missingFields, setMissingFields] = useState(false);

  const isSubmitting = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setMissingFields(true);
      return;
    }
    setMissingFields(false);

    const success = await login(username, password);
    if (success) {
      router.replace("/dashboard");
    }
  }

  let errorMessage: string | null = null;
  if (missingFields) errorMessage = t.login.required;
  else if (status === "error") errorMessage = translateError(t, errorCode);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t.common.appName}</span>
          <LanguageSwitcher />
        </div>
        <CardTitle>{t.login.title}</CardTitle>
        <CardDescription>{t.login.subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* noValidate: usamos nuestra propia validación en lugar de la del navegador. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t.login.username}</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.login.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? t.login.submitting : t.login.submit}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">{t.login.demoHint}</p>
      </CardFooter>
    </Card>
  );
}
