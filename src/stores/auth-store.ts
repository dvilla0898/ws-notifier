import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as authApi from "@/lib/mock-api/auth-api";
import { toErrorCode } from "@/lib/mock-api/errors";
import type { User } from "@/types";

export type AuthStatus = "idle" | "loading" | "error";

interface AuthData {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  /** Código de error de la API (se traduce en la UI). */
  errorCode: string | null;
}

interface AuthActions {
  /** Devuelve true si el login fue exitoso. */
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export type AuthState = AuthData & AuthActions;

export const initialAuthState: AuthData = {
  user: null,
  token: null,
  status: "idle",
  errorCode: null,
};

/**
 * Store de autenticación.
 *
 * Flujo: componente -> store.login() -> authApi.login() (1 s de espera) -> set({ user, token })
 *
 * El middleware `persist` guarda SOLO `user` y `token` en localStorage
 * ("ws-notifier:session"), así la sesión sobrevive a una recarga de la página.
 * `status` y `errorCode` son estado temporal de la UI y no se guardan.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,

      login: async (username, password) => {
        set({ status: "loading", errorCode: null });
        try {
          const { user, token } = await authApi.login(username, password);
          set({ user, token, status: "idle" });
          return true;
        } catch (error) {
          set({ status: "error", errorCode: toErrorCode(error) });
          return false;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ ...initialAuthState });
      },
    }),
    {
      name: "ws-notifier:session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      skipHydration: true,
    },
  ),
);

/** Selector reutilizable: hay sesión si existe un token. */
export const selectIsAuthenticated = (state: AuthState): boolean => state.token !== null;
