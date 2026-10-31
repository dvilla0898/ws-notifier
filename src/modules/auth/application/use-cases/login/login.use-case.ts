import { AuthErrors } from "@/modules/auth/domain/auth.errors";
import type { Session } from "@/modules/auth/domain/session";
import { Credentials } from "@/modules/auth/domain/value-objects/credentials";
import { fail, ok, type Result } from "@/shared/domain/result";

import type { LoginGateway, LoginSessionStore } from "./login.port";

export interface LoginCommand {
  username: string;
  password: string;
}

/**
 * Caso de uso: el usuario inicia sesión.
 *
 * Usa DOS puertos: uno para verificar las credenciales y otro para guardar la sesión.
 * Así el caso de uso no sabe si la "API" es real o simulada, ni si la sesión
 * vive en localStorage, en una cookie o en memoria.
 */
export class LoginUseCase {
  constructor(
    private readonly gateway: LoginGateway,
    private readonly sessionStore: LoginSessionStore,
  ) {}

  async execute(command: LoginCommand): Promise<Result<Session>> {
    const credentials = Credentials.create(command);
    if (!credentials.ok) return credentials;

    const session = await this.gateway.authenticate(credentials.value);
    if (!session) return fail(AuthErrors.invalidCredentials());

    await this.sessionStore.save(session);
    return ok(session);
  }
}
