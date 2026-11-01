import { afterEach, describe, expect, it, vi } from "vitest";

import { ok, type Result } from "@/shared/domain/result";

import { DEFAULT_API_DELAY_MS, setApiDelay } from "../delay";
import { simulateApiCall } from "../simulated-api-call";

/** Caso de uso de juguete para probar el decorador sin depender de ningún módulo. */
class EchoUseCase {
  calls = 0;
  async execute(input: { text: string }): Promise<Result<string>> {
    this.calls += 1;
    return ok(input.text.toUpperCase());
  }
}

/**
 * ¿Qué probamos? Que cada "llamada a la API" espera 1 segundo y nunca lanza excepciones.
 *
 * Técnica: "fake timers". Vitest controla el reloj y lo adelantamos a mano
 * con `vi.advanceTimersByTimeAsync(ms)`, así el test no espera 1 s de verdad.
 */
describe("simulateApiCall", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("la latencia por defecto es de 1000 ms", () => {
    expect(DEFAULT_API_DELAY_MS).toBe(1000);
  });

  it("espera exactamente 1 segundo antes de ejecutar el caso de uso", async () => {
    vi.useFakeTimers();
    setApiDelay(DEFAULT_API_DELAY_MS);
    const useCase = new EchoUseCase();
    const api = simulateApiCall(useCase);

    const promise = api.execute({ text: "hola" });

    await vi.advanceTimersByTimeAsync(999);
    expect(useCase.calls).toBe(0); // a los 999 ms todavía "viaja por la red"

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual({ ok: true, value: "HOLA" });
    expect(useCase.calls).toBe(1);
  });

  it("convierte una excepción inesperada en un Result con error UNKNOWN", async () => {
    const broken = {
      execute: async (): Promise<Result<string>> => {
        throw new Error("boom");
      },
    };

    const result = await simulateApiCall(broken).execute();

    expect(result).toMatchObject({ ok: false, error: { code: "UNKNOWN" } });
  });
});
