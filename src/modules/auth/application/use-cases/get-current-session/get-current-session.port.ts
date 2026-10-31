import type { Session } from "@/modules/auth/domain/session";

/** Lee la sesión guardada (si existe). */
export interface GetCurrentSessionStore {
  load(): Promise<Session | null>;
}
