import { describe, expect, it } from "vitest";

import { translateError } from "../translate-error";
import { dictionaries } from "../dictionaries";

/** Convierte un diccionario en su "forma": mismas claves, valores reemplazados por su tipo. */
function shapeOf(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return typeof value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]),
  );
}

describe("diccionarios de idioma", () => {
  it("inglés y español tienen exactamente las mismas claves", () => {
    // TypeScript ya lo garantiza al compilar; este test lo demuestra también en ejecución.
    expect(shapeOf(dictionaries.es)).toEqual(shapeOf(dictionaries.en));
  });

  it("los textos con variables son funciones", () => {
    expect(dictionaries.en.dashboard.welcome("Ana")).toBe("Welcome, Ana");
    expect(dictionaries.es.dashboard.welcome("Ana")).toBe("Bienvenido, Ana");
  });

  it("translateError traduce códigos conocidos y usa un mensaje genérico para el resto", () => {
    const t = dictionaries.es;

    expect(translateError(t, "SKU_TAKEN")).toBe(t.errors.SKU_TAKEN);
    expect(translateError(t, "ALGO_RARO")).toBe(t.errors.UNKNOWN);
    expect(translateError(t, null)).toBe(t.errors.UNKNOWN);
  });
});
