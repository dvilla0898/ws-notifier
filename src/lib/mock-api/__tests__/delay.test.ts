import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_API_DELAY_MS, delay, setApiDelay } from "../delay";
import { listProducts } from "../products-api";

/**
 * ¿Qué probamos? Que la API simulada realmente espera 1 segundo.
 *
 * Técnica: "fake timers". En lugar de esperar 1 s de verdad (tests lentos),
 * Vitest controla el reloj y nosotros lo adelantamos a mano con
 * `vi.advanceTimersByTimeAsync(ms)`.
 */
describe("delay (latencia simulada)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("la latencia por defecto es de 1000 ms", () => {
    expect(DEFAULT_API_DELAY_MS).toBe(1000);
  });

  it("no se resuelve antes de 1 segundo, y sí justo al cumplirse", async () => {
    vi.useFakeTimers();
    setApiDelay(DEFAULT_API_DELAY_MS);

    let resolved = false;
    const promise = delay().then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false); // a los 999 ms todavía está "esperando al servidor"

    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true); // a los 1000 ms responde

    await promise;
  });

  it("las funciones de la API también respetan la espera", async () => {
    vi.useFakeTimers();
    setApiDelay(DEFAULT_API_DELAY_MS);

    const onDone = vi.fn();
    const promise = listProducts().then(onDone);

    await vi.advanceTimersByTimeAsync(500);
    expect(onDone).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(onDone).toHaveBeenCalledTimes(1);

    await promise;
  });
});
