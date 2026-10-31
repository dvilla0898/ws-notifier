import { describe, expect, it } from "vitest";

import { Credentials } from "../value-objects/credentials";
import { Password } from "../value-objects/password";
import { Username } from "../value-objects/username";

describe("value objects de autenticación", () => {
  it("Username quita espacios y es obligatorio", () => {
    const username = Username.create("  admin ");
    expect(username.ok && username.value.value).toBe("admin");
    expect(Username.create("   ")).toMatchObject({ ok: false, error: { field: "username", reason: "required" } });
  });

  it("Password es obligatoria pero NO recorta espacios", () => {
    const password = Password.create(" secret ");
    expect(password.ok && password.value.value).toBe(" secret ");
    expect(Password.create("")).toMatchObject({ ok: false, error: { field: "password", reason: "required" } });
  });

  it("Credentials solo existe si ambos campos son válidos", () => {
    expect(Credentials.create({ username: "admin", password: "admin123" }).ok).toBe(true);
    expect(Credentials.create({ username: "admin", password: "" })).toMatchObject({
      ok: false,
      error: { field: "password" },
    });
  });
});
