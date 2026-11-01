import { describe, expect, it, vi } from "vitest";

import type { LogoutGateway, LogoutSessionStore } from "./logout.port";
import { LogoutUseCase } from "./logout.use-case";

describe("LogoutUseCase", () => {
  it("avisa a la API con el token y borra la sesión guardada", async () => {
    const gateway: LogoutGateway = { endSession: vi.fn().mockResolvedValue(undefined) };
    const sessionStore: LogoutSessionStore = {
      load: vi.fn().mockResolvedValue({ user: { id: "u1" }, token: "token-123" }),
      clear: vi.fn().mockResolvedValue(undefined),
    };

    const result = await new LogoutUseCase(gateway, sessionStore).execute();

    expect(result.ok).toBe(true);
    expect(gateway.endSession).toHaveBeenCalledWith("token-123");
    expect(sessionStore.clear).toHaveBeenCalled();
  });

  it("sin sesión guardada, solo limpia", async () => {
    const gateway: LogoutGateway = { endSession: vi.fn() };
    const sessionStore: LogoutSessionStore = {
      load: vi.fn().mockResolvedValue(null),
      clear: vi.fn().mockResolvedValue(undefined),
    };

    await new LogoutUseCase(gateway, sessionStore).execute();

    expect(gateway.endSession).not.toHaveBeenCalled();
    expect(sessionStore.clear).toHaveBeenCalled();
  });
});
