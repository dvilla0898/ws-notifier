import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import productsSeed from "@/data/products.json";
import { DB_PREFIX } from "@/lib/mock-api/storage";
import { useLocaleStore } from "@/stores/locale-store";

import { ProductsTable } from "../products-table";

/** Espera a que termine la carga inicial (la API responde en el siguiente tick). */
async function renderLoadedTable() {
  const user = userEvent.setup();
  render(<ProductsTable />);
  await screen.findByRole("table");
  return user;
}

/** Fila (<tr>) que contiene un texto, para buscar botones solo dentro de ella. */
function getRow(text: string): HTMLElement {
  const row = screen.getByText(text).closest("tr");
  if (!row) throw new Error(`No se encontró la fila de "${text}"`);
  return row;
}

describe("<ProductsTable />", () => {
  it("muestra 'cargando' mientras la API responde y luego la tabla", async () => {
    render(<ProductsTable />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading products...");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    // 1 fila de encabezados + 1 fila por producto semilla
    expect(screen.getAllByRole("row")).toHaveLength(productsSeed.length + 1);
  });

  it("formatea el precio como moneda y marca los productos agotados", async () => {
    await renderLoadedTable();

    expect(within(getRow("Wireless Mouse")).getByText("$19.99")).toBeInTheDocument();
    expect(within(getRow("Laptop Stand")).getByText("Out of stock")).toBeInTheDocument();
  });

  it("filtra por nombre, SKU o categoría", async () => {
    const user = await renderLoadedTable();

    await user.type(screen.getByLabelText("Search products"), "audio");

    expect(screen.getByText("Noise-Cancelling Headphones")).toBeInTheDocument();
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
  });

  it("avisa cuando la búsqueda no encuentra nada", async () => {
    const user = await renderLoadedTable();

    await user.type(screen.getByLabelText("Search products"), "zzz");

    expect(screen.getByText("No products match your search.")).toBeInTheDocument();
  });

  it("el enlace de editar apunta a la ruta de edición con el id", async () => {
    await renderLoadedTable();

    expect(screen.getByRole("link", { name: "Edit Wireless Mouse" })).toHaveAttribute(
      "href",
      "/dashboard/products/edit?id=p1",
    );
  });

  it("pide confirmación antes de eliminar y se puede cancelar", async () => {
    const user = await renderLoadedTable();

    await user.click(screen.getByRole("button", { name: "Delete Wireless Mouse" }));
    expect(screen.getByText('Delete "Wireless Mouse"?')).toBeInTheDocument();

    await user.click(within(getRow("Wireless Mouse")).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText('Delete "Wireless Mouse"?')).not.toBeInTheDocument();
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("elimina el producto al confirmar (y lo borra de localStorage)", async () => {
    const user = await renderLoadedTable();

    await user.click(screen.getByRole("button", { name: "Delete Wireless Mouse" }));
    await user.click(within(getRow("Wireless Mouse")).getByRole("button", { name: "Confirm" }));

    // waitFor reintenta la verificación hasta que pase (o se agote el tiempo).
    await waitFor(() => {
      expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
    });
    const stored = JSON.parse(window.localStorage.getItem(`${DB_PREFIX}products`) ?? "[]");
    expect(stored).toHaveLength(productsSeed.length - 1);
  });

  it("muestra el mensaje de lista vacía si no hay productos", async () => {
    window.localStorage.setItem(`${DB_PREFIX}products`, "[]");

    render(<ProductsTable />);

    expect(await screen.findByText("There are no products yet.")).toBeInTheDocument();
  });

  it("traduce encabezados y textos al español", async () => {
    useLocaleStore.setState({ locale: "es" });

    await renderLoadedTable();

    expect(screen.getByRole("columnheader", { name: "Precio" })).toBeInTheDocument();
    expect(within(getRow("Laptop Stand")).getByText("Agotado")).toBeInTheDocument();
  });
});
