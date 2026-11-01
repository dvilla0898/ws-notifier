import { describe, expect, it, vi } from "vitest";

import type { Session } from "@/modules/auth/domain/session";

import type { LoginGateway, LoginSessionStore } from "./login.port";
import { LoginUseCase } from "./login.use-case";

const session: Session = {
  user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
  token: "token-123",
};

/** Fakes de los DOS puertos: el test controla qué responde la "API". */
function setup(authenticated: Session | null) {
  const gateway: LoginGateway = { authenticate: vi.fn().mockResolvedValue(authenticated) };
  const sessionStore: LoginSessionStore = { save: vi.fn().mockResolvedValue(undefined) };
  return { gateway, sessionStore, useCase: new LoginUseCase(gateway, sessionStore) };
}

describe("LoginUseCase", () => {
  it("con credenciales correctas devuelve la sesión y la guarda", async () => {
    const { useCase, sessionStore } = setup(session);

    const result = await useCase.execute({ username: "admin", password: "admin123" });

    expect(result).toEqual({ ok: true, value: session });
    expect(sessionStore.save).toHaveBeenCalledWith(session);
  });

  it("con credenciales incorrectas devuelve INVALID_CREDENTIALS y no guarda nada", async () => {
    const { useCase, sessionStore } = setup(null);

    const result = await useCase.execute({ username: "admin", password: "wrong" });

    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_CREDENTIALS" } });
    expect(sessionStore.save).not.toHaveBeenCalled();
  });

  it("si faltan datos, ni siquiera llama a la API", async () => {
    const { useCase, gateway } = setup(session);

    const result = await useCase.execute({ username: "", password: "x" });

    expect(result).toMatchObject({ ok: false, error: { field: "username", reason: "required" } });
    expect(gateway.authenticate).not.toHaveBeenCalled();
  });
});
