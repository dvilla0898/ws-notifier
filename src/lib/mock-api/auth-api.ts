import usersSeed from "@/data/users.json";
import type { User } from "@/types";

import { delay } from "./delay";
import { ApiError } from "./errors";

/** En el JSON el usuario tiene contraseña; hacia afuera nunca la devolvemos. */
interface UserRecord extends User {
  password: string;
}

const users: UserRecord[] = usersSeed;

export interface LoginResponse {
  user: User;
  /** Token falso: en una API real sería un JWT o una cookie de sesión. */
  token: string;
}

/**
 * Simula `POST /auth/login`.
 * ⚠️ Solo para aprendizaje: guardar contraseñas en el frontend NO es seguro.
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  await delay();

  const record = users.find(
    (candidate) => candidate.username === username.trim() && candidate.password === password,
  );

  if (!record) {
    throw new ApiError("Invalid username or password", 401, "INVALID_CREDENTIALS");
  }

  const user: User = {
    id: record.id,
    username: record.username,
    name: record.name,
    role: record.role,
  };

  return { user, token: `mock-token-${record.id}-${Date.now()}` };
}

/** Simula `POST /auth/logout`. */
export async function logout(): Promise<void> {
  await delay();
}
