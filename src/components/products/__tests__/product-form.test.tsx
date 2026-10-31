import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { MutationResult, ProductInput } from "@/types";

import { ProductForm } from "../product-form";

/**
 * El formulario no sabe si está creando o editando: recibe `onSubmit` por props.
 * Eso lo hace fácil de probar: le pasamos una función falsa (vi.fn) y revisamos
 * con qué datos la llamó y cómo reacciona a su respuesta.
 */
function renderForm(options: { initialValues?: ProductInput; result?: MutationResult } = {}) {
  const onSubmit = vi.fn().mockResolvedValue(options.result ?? { ok: true });
  const onCancel = vi.fn();
  const user = userEvent.setup();

  render(
    <ProductForm
      initialValues={options.initialValues}
      submitLabel="Save"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );

  return { user, onSubmit, onCancel };
}

async function fillValidProduct(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Webcam HD");
  await user.type(screen.getByLabelText("SKU"), "cam-007");
  await user.type(screen.getByLabelText("Category"), "Accessories");
  await user.type(screen.getByLabelText("Price"), "49,90"); // también acepta coma decimal
  await user.type(screen.getByLabelText("Stock"), "10");
}

describe("<ProductForm />", () => {
  it("con el formulario vacío marca todos los campos como obligatorios y no envía", async () => {
    const { user, onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getAllByText("This field is required.")).toHaveLength(5);
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("muestra errores específicos para valores inválidos", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Name"), "Webcam");
    await user.type(screen.getByLabelText("SKU"), "a b");
    await user.type(screen.getByLabelText("Category"), "Accessories");
    await user.type(screen.getByLabelText("Price"), "abc");
    await user.type(screen.getByLabelText("Stock"), "-2");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Use 3 to 20 letters, numbers or dashes.")).toBeInTheDocument();
    expect(screen.getByText("Must be a number greater than 0.")).toBeInTheDocument();
    expect(screen.getByText("Must be a whole number of 0 or more.")).toBeInTheDocument();
  });

  it("quita el error de un campo cuando el usuario lo corrige", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getAllByText("This field is required.")).toHaveLength(5);

    await user.type(screen.getByLabelText("Name"), "W");

    expect(screen.getAllByText("This field is required.")).toHaveLength(4);
  });

  it("envía los datos convertidos (números y SKU en mayúsculas)", async () => {
    const { user, onSubmit } = renderForm();

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Webcam HD",
      sku: "CAM-007",
      category: "Accessories",
      price: 49.9,
      stock: 10,
    });
  });

  it("muestra el error que devuelve la API (por ejemplo, SKU repetido)", async () => {
    const { user } = renderForm({ result: { ok: false, errorCode: "SKU_TAKEN" } });

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Another product already uses this SKU.",
    );
    // El botón vuelve a estar disponible para corregir y reintentar.
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("en modo edición precarga los valores del producto", () => {
    renderForm({
      initialValues: { name: "Wireless Mouse", sku: "MOU-001", category: "Accessories", price: 19.99, stock: 120 },
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Wireless Mouse");
    expect(screen.getByLabelText("Price")).toHaveValue("19.99");
    expect(screen.getByLabelText("Stock")).toHaveValue("120");
  });

  it("el botón Cancel llama a onCancel", async () => {
    const { user, onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
