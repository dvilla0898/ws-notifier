import { ok, type Result } from "@/shared/domain/result";

import { Password } from "./password";
import { Username } from "./username";

/** Value object compuesto: usuario + contraseña, ambos ya validados. */
export class Credentials {
  private constructor(
    readonly username: Username,
    readonly password: Password,
  ) {}

  static create(input: { username: string; password: string }): Result<Credentials> {
    const username = Username.create(input.username);
    if (!username.ok) return username;
    const password = Password.create(input.password);
    if (!password.ok) return password;
    return ok(new Credentials(username.value, password.value));
  }
}
