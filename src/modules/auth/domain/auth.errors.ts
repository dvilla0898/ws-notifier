import { AppError } from "@/shared/domain/app-error";

/** Errores de negocio del módulo de autenticación. */
export const AuthErrors = {
  invalidCredentials: () => new AppError("INVALID_CREDENTIALS", "Invalid username or password"),
};
