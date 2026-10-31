import { describe, expect, it } from "vitest";

import { Credentials } from "@/modules/auth/domain/value-objects/credentials";

import { LocalStorageSessionStore, SESSION_STORAGE_KEY } from "../local-storage-session.store";
import { MockAuthGateway } from "../mock-auth.gateway";

function credentials(username: string, password: string): Credentials {
  const result = Credentials.create({ username, password });
  if (!result.ok) throw new Error("setup");
  return result.value;
}

describe("MockAuthGateway", () => {
  const gateway = new MockAuthGateway();

  it("autentica con el usuario del JSON y nunca expone la contraseña", async () => {
    const session = await gateway.authenticate(credentials(" admin ", "admin123"));

    expect(session?.user).toEqual({ id: "u1", username: "admin", name: "Admin", role: "admin" });
    expect(session?.user).not.toHaveProperty("password");
    expect(session?.token).toMatch(/^mock-token-u1-/);
  });

  it("devuelve null con credenciales incorrectas", async () => {
    expect(await gateway.authenticate(credentials("admin", "wrong"))).toBeNull();
  });
});

describe("LocalStorageSessionStore", () => {
  const session = {
    user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
    token: "t",
  };

  it("guarda, lee y borra la sesión", async () => {
    const store = new LocalStorageSessionStore();

    await store.save(session);
    expect(await new LocalStorageSessionStore().load()).toEqual(session); // sobrevive a "recargar"

    await store.clear();
    expect(await store.load()).toBeNull();
  });

  it("ignora un valor corrupto en localStorage", async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, "{not json");

    expect(await new LocalStorageSessionStore().load()).toBeNull();
  });
});
