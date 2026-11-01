"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  loginFormResolver,
  type LoginFormValues,
} from "@/modules/auth/presentation/forms/login-form.resolver";
import { useAuthStore } from "@/modules/auth/presentation/auth.store";
import { translateFieldError } from "@/shared/i18n/translate-field-error";
import { useTranslations } from "@/shared/i18n/use-translations";
import { FormField } from "@/shared/presentation/components/form-field";
import { LanguageSwitcher } from "@/shared/presentation/components/language-switcher";
import { Button } from "@/shared/presentation/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/ui/card";
import { Input } from "@/shared/presentation/ui/input";
import { Spinner } from "@/shared/presentation/ui/spinner";

/**
 * Formulario de login con react-hook-form.
 *
 * - mode "onTouched": cada campo se valida al salir de él (blur) y, una vez tocado,
 *   se revalida mientras escribes. Al enviar se valida todo y el foco va al primer error.
 * - Las reglas vienen del dominio (loginFormResolver -> Username / Password).
 * - Mientras el caso de uso responde (1 s), el <fieldset> deshabilita todo.
 */
export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: loginFormResolver,
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await login(values);
    if (result.ok) {
      router.replace("/dashboard");
      return;
    }
    // Error que no es de un campo concreto (credenciales incorrectas): va a "root".
    setError("root.server", { type: result.error.code });
  });

  const serverError = translateFieldError(t, errors.root?.server);

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
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <FormField
              id="username"
              label={t.login.username}
              error={translateFieldError(t, errors.username)}
            >
              {(describedBy) => (
                <Input
                  id="username"
                  autoComplete="username"
                  aria-invalid={errors.username ? true : undefined}
                  aria-describedby={describedBy}
                  {...register("username")}
                />
              )}
            </FormField>

            <FormField
              id="password"
              label={t.login.password}
              error={translateFieldError(t, errors.password)}
            >
              {(describedBy) => (
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={describedBy}
                  {...register("password")}
                />
              )}
            </FormField>

            {serverError && (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full">
              {isSubmitting && <Spinner />}
              {isSubmitting ? t.login.submitting : t.login.submit}
            </Button>
          </fieldset>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">{t.login.demoHint}</p>
      </CardFooter>
    </Card>
  );
}
