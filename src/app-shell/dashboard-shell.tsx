"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Package, ShoppingCart } from "lucide-react";

import { selectUser, useAuthStore } from "@/modules/auth/presentation/auth.store";
import { useTranslations } from "@/shared/i18n/use-translations";
import { cn } from "@/shared/lib/utils";
import { LanguageSwitcher } from "@/shared/presentation/components/language-switcher";
import { Button } from "@/shared/presentation/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/presentation/ui/sheet";
import { Spinner } from "@/shared/presentation/ui/spinner";

/**
 * Elementos del menú. `href: null` = módulo aún no disponible (Ventas llega en la fase 2).
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

/** Lista de enlaces. Se usa en el menú lateral (escritorio) y en el panel (móvil). */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav aria-label={t.nav.main} className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const label = t.nav[item.key];

        if (item.href === null) {
          return (
            <span
              key={item.key}
              aria-disabled="true"
              className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground/70 md:min-h-9"
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
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm transition-colors md:min-h-9",
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
  );
}

/**
 * Estructura del panel.
 *
 *  - Escritorio (≥ md): menú lateral fijo + cabecera con usuario, idioma y salir.
 *  - Móvil (< md): barra superior con el nombre de la app y un botón ☰ que abre
 *    un panel lateral (Sheet) con la navegación, el usuario, el idioma y salir.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    setMenuOpen(false);
    router.replace("/login");
  }

  const logoutButton = (fullWidth: boolean) => (
    <Button
      variant="outline"
      size={fullWidth ? "default" : "sm"}
      className={cn(fullWidth && "w-full")}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? <Spinner /> : <LogOut aria-hidden="true" />}
      {isLoggingOut ? t.nav.loggingOut : t.nav.logout}
    </Button>
  );

  return (
    <div className="min-h-screen bg-muted/40 md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-background md:block">
        <div className="flex h-14 items-center px-4 font-semibold">{t.common.appName}</div>
        <div className="px-2">
          <NavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4">
          <span className="font-semibold md:hidden">{t.common.appName}</span>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <LanguageSwitcher />
            {logoutButton(false)}
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-label={t.nav.openMenu}>
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent title={t.nav.menu} closeLabel={t.common.close}>
              <NavLinks onNavigate={() => setMenuOpen(false)} />
              <div className="mt-auto space-y-4 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-muted-foreground">{user?.name}</span>
                  <LanguageSwitcher />
                </div>
                {logoutButton(true)}
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
