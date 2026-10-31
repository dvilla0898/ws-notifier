import type { LoginGateway } from "@/modules/auth/application/use-cases/login/login.port";
import type { LogoutGateway } from "@/modules/auth/application/use-cases/logout/logout.port";
import type { Session, User } from "@/modules/auth/domain/session";
import type { Credentials } from "@/modules/auth/domain/value-objects/credentials";

import usersSeed from "./seed/users.json";

interface UserRecord extends User {
  password: string;
}

/**
 * Adaptador que simula la API de autenticación con un JSON de usuarios.
 * ⚠️ Solo para aprendizaje: guardar contraseñas en el frontend NO es seguro.
 */
export class MockAuthGateway implements LoginGateway, LogoutGateway {
  constructor(private readonly users: UserRecord[] = usersSeed) {}

  async authenticate(credentials: Credentials): Promise<Session | null> {
    const record = this.users.find(
      (user) =>
        user.username === credentials.username.value &&
        user.password === credentials.password.value,
    );
    if (!record) return null;

    const user: User = {
      id: record.id,
      username: record.username,
      name: record.name,
      role: record.role,
    };
    return { user, token: `mock-token-${record.id}-${Date.now()}` };
  }

  async endSession(): Promise<void> {
    // Una API real invalidaría el token aquí. La simulada no necesita hacer nada.
  }
}
