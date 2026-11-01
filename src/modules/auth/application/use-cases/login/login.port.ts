import type { Session } from "@/modules/auth/domain/session";
import type { Credentials } from "@/modules/auth/domain/value-objects/credentials";

/** Quién comprueba las credenciales (la API de autenticación). */
export interface LoginGateway {
  /** Devuelve la sesión si las credenciales son correctas, o null si no. */
  authenticate(credentials: Credentials): Promise<Session | null>;
}

/** Dónde se guarda la sesión para que sobreviva a una recarga. */
export interface LoginSessionStore {
  save(session: Session): Promise<void>;
}
