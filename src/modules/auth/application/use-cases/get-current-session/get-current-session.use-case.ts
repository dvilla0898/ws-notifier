import type { Session } from "@/modules/auth/domain/session";
import { ok, type Result } from "@/shared/domain/result";

import type { GetCurrentSessionStore } from "./get-current-session.port";

/**
 * Caso de uso (del sistema): al abrir la app, recuperar la sesión guardada.
 * Devuelve `null` si no hay sesión; eso no es un error.
 */
export class GetCurrentSessionUseCase {
  constructor(private readonly sessionStore: GetCurrentSessionStore) {}

  async execute(): Promise<Result<Session | null>> {
    return ok(await this.sessionStore.load());
  }
}
