import type { AppError } from "./app-error";

/**
 * Respuesta centralizada de TODOS los casos de uso.
 *
 * En lugar de lanzar excepciones, un caso de uso devuelve:
 *   - { ok: true,  value }  si salió bien
 *   - { ok: false, error }  si algo falló (error es un AppError con código)
 *
 * TypeScript obliga a revisar `result.ok` antes de usar `value`, así que
 * es imposible "olvidarse" de manejar un error:
 *
 *   const result = await productsContainer.createProduct.execute(input);
 *   if (!result.ok) return showError(result.error);
 *   console.log(result.value.name);
 */
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Fail<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = AppError> = Ok<T> | Fail<E>;

export function ok(): Ok<void>;
export function ok<T>(value: T): Ok<T>;
export function ok<T>(value?: T): Ok<T | undefined> {
  return { ok: true, value };
}

export function fail<E = AppError>(error: E): Fail<E> {
  return { ok: false, error };
}
