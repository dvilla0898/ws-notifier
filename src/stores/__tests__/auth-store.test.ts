import { describe, expect, it } from "vitest";

import { selectIsAuthenticated, useAuthStore } from "../auth-store";

/**
 * Los stores de Zustand se pueden probar SIN renderizar componentes:
 *  - useAuthStore.getState() lee el estado y las acciones;
 *  - useAuthStore.setState() lo modifica directamente.
 */
describe("auth-store", () => {
  it("empieza sin sesión", () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it("pasa por 'loading' mientras espera a la API", async () => {
    const promise = useAuthStore.getState().login("admin", "admin123");

    // La acción ya cambió el estado, aunque la API todavía no respondió.
    expect(useAuthStore.getState().status).toBe("loading");

    await promise;
    expect(useAuthStore.getState().status).toBe("idle");
  });

  it("login correcto: guarda usuario y token, y persiste la sesión en localStorage", async () => {
    const success = await useAuthStore.getState().login("admin", "admin123");

    expect(success).toBe(true);
    const state = useAuthStore.getState();
    expect(state.user?.username).toBe("admin");
    expect(selectIsAuthenticated(state)).toBe(true);

    // El middleware `persist` guarda solo user y token (gracias a `partialize`).
    const saved = JSON.parse(window.localStorage.getItem("ws-notifier:session") ?? "{}");
    expect(saved.state).toEqual({ user: state.user, token: state.token });
  });

  it("login incorrecto: no inicia sesión y guarda el código de error", async () => {
    const success = await useAuthStore.getState().login("admin", "bad-password");

    expect(success).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      status: "error",
      errorCode: "INVALID_CREDENTIALS",
      token: null,
    });
  });

  it("logout: borra la sesión", async () => {
    await useAuthStore.getState().login("admin", "admin123");

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, status: "idle" });
  });
});
