import type { GetCurrentSessionStore } from "@/modules/auth/application/use-cases/get-current-session/get-current-session.port";
import type { LoginSessionStore } from "@/modules/auth/application/use-cases/login/login.port";
import type { LogoutSessionStore } from "@/modules/auth/application/use-cases/logout/logout.port";
import type { Session } from "@/modules/auth/domain/session";

export const SESSION_STORAGE_KEY = "ws-notifier:session";

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Session>;
  return typeof candidate.token === "string" && typeof candidate.user?.id === "string";
}

/**
 * Adaptador que guarda la sesión en localStorage.
 * Implementa los puertos de login, logout y get-current-session.
 */
export class LocalStorageSessionStore
  implements LoginSessionStore, LogoutSessionStore, GetCurrentSessionStore
{
  constructor(private readonly key: string = SESSION_STORAGE_KEY) {}

  async load(): Promise<Session | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(session: Session): Promise<void> {
    window.localStorage.setItem(this.key, JSON.stringify(session));
  }

  async clear(): Promise<void> {
    window.localStorage.removeItem(this.key);
  }
}
