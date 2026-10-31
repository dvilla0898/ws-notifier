"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, ShoppingCart } from "lucide-react";

import { Button } from "@/shared/presentation/ui/button";
import { Spinner } from "@/shared/presentation/ui/spinner";
import { useTranslations } from "@/shared/i18n/use-translations";
import { cn } from "@/shared/lib/utils";
import { selectUser, useAuthStore } from "@/modules/auth/presentation/auth.store";

import { LanguageSwitcher } from "@/shared/presentation/components/language-switcher";

/**
 * Menú lateral. `href: null` = módulo aún no disponible (Ventas llega en la fase 2).
 * Para agregar un módulo: añade un elemento aquí, su texto en los diccionarios
 * y su carpeta en src/app/dashboard/.
 */
const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/dashboard/products", icon: Package },
  { key: "sales", href: null, icon: ShoppingCart },
] as const;

/** Con `trailingSlash: true` las rutas llegan como "/dashboard/products/". */
function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isActive(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  if (href === "/dashboard") return current === href;
  return current === href || current.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-muted/40 md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-background md:border-r md:border-b-0">
        <div className="flex h-14 items-center px-4 font-semibold">{t.common.appName}</div>
        <nav aria-label={t.nav.main} className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = t.nav[item.key];

            if (item.href === null) {
              return (
                <span
                  key={item.key}
                  aria-disabled="true"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground/70"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                    {t.common.comingSoon}
                  </span>
                </span>
              );
            }

            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b bg-background px-4">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? <Spinner /> : <LogOut aria-hidden="true" />}
            {isLoggingOut ? t.nav.loggingOut : t.nav.logout}
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
