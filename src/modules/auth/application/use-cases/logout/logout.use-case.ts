import { ok, type Result } from "@/shared/domain/result";

import type { LogoutGateway, LogoutSessionStore } from "./logout.port";

/** Caso de uso: el usuario cierra sesión. */
export class LogoutUseCase {
  constructor(
    private readonly gateway: LogoutGateway,
    private readonly sessionStore: LogoutSessionStore,
  ) {}

  async execute(): Promise<Result<void>> {
    const session = await this.sessionStore.load();
    if (session) {
      await this.gateway.endSession(session.token);
    }
    await this.sessionStore.clear();
    return ok();
  }
}
