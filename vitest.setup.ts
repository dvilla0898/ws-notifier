/**
 * Se ejecuta antes de cada archivo de test (ver `setupFiles` en vitest.config.mts).
 */
import "@testing-library/jest-dom/vitest";

import type { ReactNode } from "react";
import { beforeEach, vi } from "vitest";

import { resetAppState } from "@/test/reset-app-state";
import { resetRouterMock } from "@/test/router-mock";

// 1) Matchers extra para el DOM: toBeInTheDocument(), toBeDisabled(), toHaveTextContent()...
//    (los agrega el import de "@testing-library/jest-dom/vitest" de arriba).

// 2) next/navigation solo funciona dentro de Next.js: lo reemplazamos por un router falso.
vi.mock("next/navigation", async () => {
  const { routerMock, navigationState } = await import("@/test/router-mock");
  return {
    useRouter: () => routerMock,
    usePathname: () => navigationState.pathname,
    useSearchParams: () => navigationState.searchParams,
  };
});

// 3) next/link depende del router de Next.js: en los tests basta con un <a> normal.
vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ href, children, ...rest }: { href: string; children?: ReactNode }) =>
      createElement("a", { ...(rest as object), href }, children),
  };
});

// 4) Antes de CADA test: stores limpios, localStorage vacío, latencia 0 y router limpio.
beforeEach(() => {
  resetAppState();
  resetRouterMock();
});
