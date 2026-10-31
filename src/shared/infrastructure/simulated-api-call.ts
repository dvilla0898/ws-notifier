import { AppError } from "@/shared/domain/app-error";
import { fail, type Result } from "@/shared/domain/result";

import { delay } from "./delay";

type ExecutableUseCase = { execute: (...args: never[]) => Promise<Result<unknown>> };

/**
 * Decorador que convierte un caso de uso en una "llamada a la API":
 *
 *   1. Espera la latencia simulada (1 s por defecto).
 *   2. Ejecuta el caso de uso.
 *   3. Si algo lanza una excepción inesperada, la convierte en fail(AppError UNKNOWN),
 *      así la UI SIEMPRE recibe un Result y nunca una excepción.
 *
 * Se aplica en el contenedor de cada módulo. Ni el caso de uso ni el repositorio
 * saben que existe: la latencia es un detalle de infraestructura.
 *
 *   createProduct: simulateApiCall(new CreateProductUseCase(repository))
 */
export function simulateApiCall<TUseCase extends ExecutableUseCase>(
  useCase: TUseCase,
): Pick<TUseCase, "execute"> {
  const run = useCase.execute as (...args: unknown[]) => Promise<Result<unknown>>;

  const execute = async (...args: unknown[]): Promise<Result<unknown>> => {
    await delay();
    try {
      return await run.apply(useCase, args);
    } catch (error) {
      return fail(AppError.unexpected(error));
    }
  };

  return { execute } as unknown as Pick<TUseCase, "execute">;
}
