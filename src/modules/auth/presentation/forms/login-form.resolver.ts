import type { FieldErrors, Resolver } from "react-hook-form";

import { Password } from "@/modules/auth/domain/value-objects/password";
import { Username } from "@/modules/auth/domain/value-objects/username";
import { toFieldError } from "@/shared/presentation/forms/to-field-error";

export interface LoginFormValues {
  username: string;
  password: string;
}

/**
 * Resolver de react-hook-form para el login.
 *
 * Un "resolver" es la función que react-hook-form llama para validar.
 * En lugar de escribir reglas nuevas (como haría un esquema de zod), le
 * PREGUNTAMOS AL DOMINIO: así la regla "usuario obligatorio" vive en un solo lugar.
 */
export const loginFormResolver: Resolver<LoginFormValues> = async (values) => {
  const errors: FieldErrors<LoginFormValues> = {};

  const username = Username.create(values.username);
  if (!username.ok) errors.username = toFieldError(username.error);

  const password = Password.create(values.password);
  if (!password.ok) errors.password = toFieldError(password.error);

  return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
};
