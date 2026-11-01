import { GetCurrentSessionUseCase } from "@/modules/auth/application/use-cases/get-current-session/get-current-session.use-case";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login/login.use-case";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout/logout.use-case";
import { LocalStorageSessionStore } from "@/modules/auth/infrastructure/local-storage-session.store";
import { MockAuthGateway } from "@/modules/auth/infrastructure/mock-auth.gateway";
import { simulateApiCall } from "@/shared/infrastructure/simulated-api-call";

/**
 * Contenedor del módulo de autenticación (raíz de composición).
 *
 * login y logout "van a la API" (1 s de latencia simulada).
 * getCurrentSession solo lee localStorage al abrir la app: es local e instantáneo.
 */
const gateway = new MockAuthGateway();
const sessionStore = new LocalStorageSessionStore();

export const authContainer = {
  login: simulateApiCall(new LoginUseCase(gateway, sessionStore)),
  logout: simulateApiCall(new LogoutUseCase(gateway, sessionStore)),
  getCurrentSession: new GetCurrentSessionUseCase(sessionStore),
};
