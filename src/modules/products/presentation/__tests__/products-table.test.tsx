import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import productsSeed from "@/modules/products/infrastructure/seed/products.json";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { DB_PREFIX } from "@/shared/infrastructure/local-storage-collection";

import { ProductsTable } from "../components/products-table";

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
    expect(screen.getAllByRole("row")).toHaveLength(productsSeed.length + 1);
  });

  it("formatea el precio y marca los productos agotados", async () => {
    await renderLoadedTable();

    expect(within(getRow("Wireless Mouse")).getByText("$19.99")).toBeInTheDocument();
    expect(within(getRow("Laptop Stand")).getByText("Out of stock")).toBeInTheDocument();
  });

  it("busca con el caso de uso search-products (con debounce)", async () => {
    const user = await renderLoadedTable();

    await user.type(screen.getByLabelText("Search products"), "audio");

    // La búsqueda ocurre 300 ms después de la última tecla: esperamos con waitFor.
    await waitFor(() => expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument());
    expect(screen.getByText("Noise-Cancelling Headphones")).toBeInTheDocument();
  });

  it("avisa cuando la búsqueda no encuentra nada y vuelve al listado al borrarla", async () => {
    const user = await renderLoadedTable();
    const search = screen.getByLabelText("Search products");

    await user.type(search, "zzz");
    expect(await screen.findByText("No products match your search.")).toBeInTheDocument();

    await user.clear(search);
    expect(await screen.findByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("el enlace de editar apunta a la ruta de edición con el id", async () => {
    await renderLoadedTable();

    expect(screen.getByRole("link", { name: "Edit Wireless Mouse" })).toHaveAttribute(
      "href",
      "/dashboard/products/edit?id=p1",
    );
  });

  it("pide confirmación y elimina el producto (también de localStorage)", async () => {
    const user = await renderLoadedTable();

    await user.click(screen.getByRole("button", { name: "Delete Wireless Mouse" }));
    expect(screen.getByText('Delete "Wireless Mouse"?')).toBeInTheDocument();
    await user.click(within(getRow("Wireless Mouse")).getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument());
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
