/**
 * "Base de datos" del navegador, compartida por los adaptadores de cada módulo.
 *
 * Cada colección (por ejemplo "products") se guarda como un arreglo JSON en
 * localStorage bajo la clave `ws-notifier:db:<colección>`.
 * La primera vez se inicializa con los datos semilla (seed/*.json del módulo).
 */
export const DB_PREFIX = "ws-notifier:db:";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class LocalStorageCollection<T> {
  private readonly key: string;
  private readonly seed: T[];

  constructor(name: string, seed: T[]) {
    this.key = DB_PREFIX + name;
    this.seed = seed;
  }

  read(): T[] {
    // Durante el build estático de Next.js no existe `window`: devolvemos la semilla.
    if (!isBrowser()) return clone(this.seed);

    const raw = window.localStorage.getItem(this.key);
    if (raw === null) {
      this.write(this.seed);
      return clone(this.seed);
    }

    try {
      return JSON.parse(raw) as T[];
    } catch {
      // Valor corrupto (por ejemplo, editado a mano): volvemos a la semilla.
      this.write(this.seed);
      return clone(this.seed);
    }
  }

  write(items: T[]): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }
}
