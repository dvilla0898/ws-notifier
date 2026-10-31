/**
 * "Base de datos" del navegador.
 *
 * Cada colección (por ejemplo "products") se guarda como un arreglo JSON en
 * localStorage bajo la clave `ws-notifier:db:<colección>`.
 * La primera vez que se lee una colección, se inicializa con los datos semilla
 * de src/data/*.json. A partir de ahí, los cambios persisten al recargar la página.
 */
export const DB_PREFIX = "ws-notifier:db:";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readCollection<T>(collection: string, seed: T[]): T[] {
  // Durante el build estático de Next.js no existe `window`: devolvemos la semilla.
  if (!isBrowser()) return clone(seed);

  const key = DB_PREFIX + collection;
  const raw = window.localStorage.getItem(key);

  if (raw === null) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return clone(seed);
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    // Si alguien editó el valor a mano y quedó corrupto, volvemos a la semilla.
    window.localStorage.setItem(key, JSON.stringify(seed));
    return clone(seed);
  }
}

export function writeCollection<T>(collection: string, items: T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(DB_PREFIX + collection, JSON.stringify(items));
}

/** Borra todas las colecciones: la próxima lectura vuelve a usar los datos semilla. */
export function resetDatabase(): void {
  if (!isBrowser()) return;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(DB_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
}
