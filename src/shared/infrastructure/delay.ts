/**
 * Latencia simulada de la "API".
 *
 * No la llaman los repositorios ni los casos de uso: la aplica `simulateApiCall`
 * (ver simulated-api-call.ts) desde el contenedor de cada módulo, una sola vez
 * por acción, como lo haría una petición HTTP real.
 */
export const DEFAULT_API_DELAY_MS = 1000;

let currentDelayMs = DEFAULT_API_DELAY_MS;

/** Los tests la ponen en 0 para no esperar 1 s por llamada (ver src/test/reset-app-state.ts). */
export function setApiDelay(ms: number): void {
  currentDelayMs = ms;
}

export function getApiDelay(): number {
  return currentDelayMs;
}

/** Devuelve una promesa que se resuelve después de `ms` milisegundos. */
export function delay(ms: number = currentDelayMs): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
