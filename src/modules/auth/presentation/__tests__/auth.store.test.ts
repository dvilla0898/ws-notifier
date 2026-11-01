import { describe, expect, it } from "vitest";

import { SESSION_STORAGE_KEY } from "@/modules/auth/infrastructure/local-storage-session.store";

import { selectIsAuthenticated, selectUser, useAuthStore } from "../auth.store";

/**
 * Test de integración del módulo: store -> contenedor -> caso de uso -> adaptadores reales.
 * (La latencia está en 0 gracias a vitest.setup.ts.)
 */
describe("auth.store", () => {
  it("pasa por 'loading' y guarda la sesión al iniciar sesión", async () => {
    const promise = useAuthStore.getState().login({ username: "admin", password: "admin123" });
    expect(useAuthStore.getState().status).toBe("loading");

    const result = await promise;

    expect(result.ok).toBe(true);
    expect(selectUser(useAuthStore.getState())?.name).toBe("Admin");
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toContain("mock-token-u1");
  });

  it("con credenciales incorrectas guarda el AppError en el estado", async () => {
    await useAuthStore.getState().login({ username: "admin", password: "bad" });

    expect(useAuthStore.getState()).toMatchObject({
      status: "error",
      error: { code: "INVALID_CREDENTIALS" },
      session: null,
    });
  });

  it("restoreSession recupera la sesión guardada (como al recargar la página)", async () => {
    await useAuthStore.getState().login({ username: "admin", password: "admin123" });
    useAuthStore.setState({ session: null }); // simulamos una recarga: memoria vacía

    await useAuthStore.getState().restoreSession();

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it("logout borra la sesión del estado y de localStorage", async () => {
    await useAuthStore.getState().login({ username: "admin", password: "admin123" });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().session).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
