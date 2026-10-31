import { describe, expect, it } from "vitest";

import { login } from "../auth-api";

/**
 * Tests de la API de autenticación (pura lógica, sin componentes).
 * Patrón AAA en cada test: Arrange (preparar), Act (ejecutar), Assert (verificar).
 */
describe("auth-api", () => {
  it("devuelve el usuario y un token con credenciales correctas", async () => {
    const response = await login("admin", "admin123");

    expect(response.user).toEqual({ id: "u1", username: "admin", name: "Admin", role: "admin" });
    expect(response.token).toMatch(/^mock-token-u1-/);
  });

  it("nunca expone la contraseña del usuario", async () => {
    const { user } = await login("admin", "admin123");

    expect(user).not.toHaveProperty("password");
  });

  it("ignora espacios alrededor del nombre de usuario", async () => {
    await expect(login("  admin  ", "admin123")).resolves.toHaveProperty("user.username", "admin");
  });

  it("rechaza credenciales incorrectas con el código INVALID_CREDENTIALS", async () => {
    // `rejects` espera que la promesa falle; toMatchObject revisa solo los campos indicados.
    await expect(login("admin", "wrong")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      status: 401,
    });
  });
});
