import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ProductDto, ProductInput } from "@/modules/products/application/product.dto";
import { AppError } from "@/shared/domain/app-error";
import { fail, ok, type Result } from "@/shared/domain/result";

import { ProductForm } from "../components/product-form";

type SubmitResult = Result<ProductDto>;

/**
 * El formulario no sabe si crea o edita: recibe `onSubmit` por props.
 * Le pasamos una función falsa (vi.fn) y revisamos con qué la llamó y cómo
 * reacciona a su Result.
 */
function renderForm(options: { initialValues?: ProductInput; result?: SubmitResult } = {}) {
  const onSubmit = vi
    .fn<(input: ProductInput) => Promise<SubmitResult>>()
    .mockResolvedValue(options.result ?? ok({} as ProductDto));
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
  it("valida un campo al salir de él, con la regla del dominio", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText("SKU"), "a b");
    await user.tab(); // blur

    expect(await screen.findByText("Use 3 to 20 letters, numbers or dashes.")).toBeInTheDocument();
  });

  it("al enviar vacío marca los 5 campos, enfoca el primero y no envía", async () => {
    const { user, onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findAllByText("This field is required.")).toHaveLength(5);
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("revalida mientras corriges un campo con error", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findAllByText("This field is required.");

    await user.type(screen.getByLabelText("Name"), "W");

    // El error cambia en cuanto escribes: de "obligatorio" a "mínimo 2 caracteres".
    expect(await screen.findByText("Must be at least 2 characters.")).toBeInTheDocument();
    expect(screen.getAllByText("This field is required.")).toHaveLength(4);
  });

  it("muestra los errores específicos de cada value object", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Name"), "Webcam");
    await user.type(screen.getByLabelText("SKU"), "OK-123");
    await user.type(screen.getByLabelText("Category"), "Accessories");
    await user.type(screen.getByLabelText("Price"), "abc");
    await user.type(screen.getByLabelText("Stock"), "-2");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Must be a number greater than 0.")).toBeInTheDocument();
    expect(screen.getByText("Must be a whole number of 0 or more.")).toBeInTheDocument();
  });

  it("envía los datos convertidos a números", async () => {
    const { user, onSubmit } = renderForm();

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Webcam HD",
      sku: "cam-007", // el dominio lo normaliza a mayúsculas al crear el producto
      category: "Accessories",
      price: 49.9,
      stock: 10,
    });
  });

  it("muestra un error de la API debajo del campo afectado (SKU repetido)", async () => {
    const { user } = renderForm({
      result: fail(new AppError("SKU_TAKEN", "dup", { field: "sku" })),
    });

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Another product already uses this SKU.")).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("muestra un error general de la API arriba de los botones", async () => {
    const { user } = renderForm({ result: fail(AppError.unexpected()) });

    await fillValidProduct(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong.");
  });

  it("en modo edición precarga los valores", () => {
    renderForm({
      initialValues: { name: "Wireless Mouse", sku: "MOU-001", category: "Accessories", price: 19.99, stock: 120 },
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Wireless Mouse");
    expect(screen.getByLabelText("Price")).toHaveValue("19.99");
  });

  it("el botón Cancel llama a onCancel", async () => {
    const { user, onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
