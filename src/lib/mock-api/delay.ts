/**
 * Latencia simulada de la "API".
 *
 * Cada función de la API llama a `await delay()` antes de responder,
 * así la interfaz se comporta como si hablara con un servidor real
 * (estados de carga, botones deshabilitados, etc.).
 */
export const DEFAULT_API_DELAY_MS = 1000;

let currentDelayMs = DEFAULT_API_DELAY_MS;

/**
 * Cambia la latencia. Los tests la ponen en 0 para no esperar 1 s en cada prueba
 * (ver src/test/reset-app-state.ts).
 */
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
