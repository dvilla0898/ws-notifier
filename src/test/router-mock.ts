import { vi } from "vitest";

/**
 * Router falso para los tests.
 *
 * Next.js solo puede crear un router real dentro de su servidor. En los tests,
 * vitest.setup.ts reemplaza `next/navigation` por este objeto, y así podemos
 * comprobar a dónde intentó navegar un componente:
 *
 *   expect(routerMock.replace).toHaveBeenCalledWith("/dashboard");
 */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

/** Valores que devuelven usePathname() y useSearchParams(). Un test puede cambiarlos. */
export const navigationState = {
  pathname: "/dashboard",
  searchParams: new URLSearchParams(),
};

export function resetRouterMock(): void {
  Object.values(routerMock).forEach((fn) => fn.mockClear());
  navigationState.pathname = "/dashboard";
  navigationState.searchParams = new URLSearchParams();
}
