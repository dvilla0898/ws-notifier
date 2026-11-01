import { create } from "zustand";

import { authContainer } from "@/modules/auth/auth.container";
import type { LoginCommand } from "@/modules/auth/application/use-cases/login/login.use-case";
import type { Session, User } from "@/modules/auth/domain/session";
import type { AppError } from "@/shared/domain/app-error";
import type { Result } from "@/shared/domain/result";

export type AuthStatus = "idle" | "loading" | "error";

interface AuthData {
  session: Session | null;
  status: AuthStatus;
  error: AppError | null;
}

interface AuthActions {
  /** Al abrir la app: recupera la sesión guardada (caso de uso get-current-session). */
  restoreSession: () => Promise<void>;
  login: (command: LoginCommand) => Promise<Result<Session>>;
  logout: () => Promise<void>;
}

export type AuthState = AuthData & AuthActions;

export const initialAuthState: AuthData = {
  session: null,
  status: "idle",
  error: null,
};

/**
 * Store de autenticación (capa de presentación).
 *
 * Solo guarda ESTADO DE PANTALLA: ¿hay sesión?, ¿está cargando?, ¿hubo error?
 * Toda la lógica (validar, autenticar, guardar la sesión) está en los casos de uso.
 * El store solo los llama a través de `authContainer` y refleja el resultado.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  ...initialAuthState,

  restoreSession: async () => {
    const result = await authContainer.getCurrentSession.execute();
    if (result.ok) set({ session: result.value });
  },

  login: async (command) => {
    set({ status: "loading", error: null });
    const result = await authContainer.login.execute(command);
    if (result.ok) set({ session: result.value, status: "idle" });
    else set({ status: "error", error: result.error });
    return result;
  },

  logout: async () => {
    await authContainer.logout.execute();
    set({ ...initialAuthState });
  },
}));

export const selectIsAuthenticated = (state: AuthState): boolean => state.session !== null;
export const selectUser = (state: AuthState): User | null => state.session?.user ?? null;
