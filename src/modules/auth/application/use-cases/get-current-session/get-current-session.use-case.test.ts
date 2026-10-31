import { describe, expect, it } from "vitest";

import type { Session } from "@/modules/auth/domain/session";

import { GetCurrentSessionUseCase } from "./get-current-session.use-case";

describe("GetCurrentSessionUseCase", () => {
  it("devuelve la sesión guardada", async () => {
    const session: Session = {
      user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
      token: "t",
    };
    const useCase = new GetCurrentSessionUseCase({ load: async () => session });

    expect(await useCase.execute()).toEqual({ ok: true, value: session });
  });

  it("sin sesión devuelve null: no es un error", async () => {
    const useCase = new GetCurrentSessionUseCase({ load: async () => null });

    expect(await useCase.execute()).toEqual({ ok: true, value: null });
  });
});
