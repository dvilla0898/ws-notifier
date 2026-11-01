import { describe, expect, it } from "vitest";

import { AppError } from "../app-error";
import { fail, ok, type Result } from "../result";

describe("Result", () => {
  it("ok() envuelve un valor exitoso", () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
    expect(ok()).toEqual({ ok: true, value: undefined });
  });

  it("fail() envuelve un error", () => {
    const error = new AppError("SKU_TAKEN", "dup");
    expect(fail(error)).toEqual({ ok: false, error });
  });

  it("TypeScript obliga a revisar `ok` antes de usar `value` (narrowing)", () => {
    const divide = (a: number, b: number): Result<number> =>
      b === 0 ? fail(AppError.unexpected("division by zero")) : ok(a / b);

    const good = divide(10, 2);
    const bad = divide(1, 0);

    // Dentro del `if`, TypeScript ya sabe si existe `value` o `error`.
    if (good.ok) expect(good.value).toBe(5);
    if (!bad.ok) expect(bad.error.code).toBe("UNKNOWN");
  });
});

describe("AppError", () => {
  it("AppError.validation guarda el campo y el motivo", () => {
    const error = AppError.validation("price", "positive");

    expect(error).toMatchObject({ code: "VALIDATION_ERROR", field: "price", reason: "positive" });
  });
});
