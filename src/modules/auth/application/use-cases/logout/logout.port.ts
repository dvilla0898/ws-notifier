import type { Session } from "@/modules/auth/domain/session";

/** Avisa a la API que la sesión terminó. */
export interface LogoutGateway {
  endSession(token: string): Promise<void>;
}

/** Lee y borra la sesión guardada. */
export interface LogoutSessionStore {
  load(): Promise<Session | null>;
  clear(): Promise<void>;
}
