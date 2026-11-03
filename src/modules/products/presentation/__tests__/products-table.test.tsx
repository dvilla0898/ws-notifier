import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import productsSeed from "@/modules/products/infrastructure/seed/products.json";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { DB_PREFIX } from "@/shared/infrastructure/local-storage-collection";

import { ProductsTable } from "../components/products-table";

/**
 * La pantalla dibuja DOS vistas: tarjetas (móvil/tablet) y tabla (escritorio, ≥ 1024 px).
 * jsdom no aplica CSS, así que ambas existen en el DOM del test. Por eso cada
 * consulta se hace DENTRO de una de las dos vistas con `within(...)`.
 */
async function renderLoaded() {
  const user = userEvent.setup();
  render(<ProductsTable />);
  const table = await screen.findByRole("table");
  const cards = screen.getByRole("list", { name: "Products" });
  return { user, table, cards };
}

/** Fila (<tr>) de la tabla que contiene un texto. */
function rowOf(table: HTMLElement, text: string): HTMLElement {
  const row = within(table).getByText(text).closest("tr");
  if (!row) throw new Error(`No se encontró la fila de "${text}"`);
  return row;
}

describe("<ProductsTable />", () => {
  it("muestra el skeleton mientras la API responde y luego los datos", async () => {
    render(<ProductsTable />);

    // El skeleton es visual; para lectores de pantalla anuncia el texto de carga.
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading products...");
    expect(status).toHaveAttribute("aria-busy", "true");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("tabla (escritorio): una fila por producto, con moneda y agotado", async () => {
    const { table } = await renderLoaded();

    expect(within(table).getAllByRole("row")).toHaveLength(productsSeed.length + 1);
    expect(within(rowOf(table, "Wireless Mouse")).getByText("$19.99")).toBeInTheDocument();
    expect(within(rowOf(table, "Laptop Stand")).getByText("Out of stock")).toBeInTheDocument();
  });

  it("tarjetas (móvil/tablet): una tarjeta por producto con sus acciones", async () => {
    const { cards } = await renderLoaded();

    const items = within(cards).getAllByRole("listitem");
    expect(items).toHaveLength(productsSeed.length);
    const mouse = items.find((item) => item.textContent?.includes("Wireless Mouse"));
    if (!mouse) throw new Error("setup");
    expect(within(mouse).getByText("$19.99")).toBeInTheDocument();
    expect(within(mouse).getByRole("button", { name: "Delete Wireless Mouse" })).toBeInTheDocument();
  });

  it("busca con el caso de uso search-products (con debounce)", async () => {
    const { user, table } = await renderLoaded();

    await user.type(screen.getByLabelText("Search products"), "audio");

    await waitFor(() => expect(within(table).queryByText("Wireless Mouse")).not.toBeInTheDocument());
    expect(within(table).getByText("Noise-Cancelling Headphones")).toBeInTheDocument();
  });

  it("avisa cuando la búsqueda no encuentra nada y vuelve al listado al borrarla", async () => {
    const { user } = await renderLoaded();
    const search = screen.getByLabelText("Search products");

    await user.type(search, "zzz");
    expect(await screen.findByText("No products match your search.")).toBeInTheDocument();

    await user.clear(search);
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("el enlace de editar apunta a la ruta de edición con el id", async () => {
    const { table } = await renderLoaded();

    expect(within(table).getByRole("link", { name: "Edit Wireless Mouse" })).toHaveAttribute(
      "href",
      "/dashboard/products/edit?id=p1",
    );
  });

  it("pide confirmación en un diálogo y se puede cancelar", async () => {
    const { user, table } = await renderLoaded();

    await user.click(within(table).getByRole("button", { name: "Delete Wireless Mouse" }));

    const dialog = await screen.findByRole("alertdialog", { name: "Delete product?" });
    expect(dialog).toHaveTextContent('"Wireless Mouse" will be permanently deleted.');
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(within(table).getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("elimina el producto al confirmar (también de localStorage)", async () => {
    const { user, table } = await renderLoaded();

    await user.click(within(table).getByRole("button", { name: "Delete Wireless Mouse" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(within(table).queryByText("Wireless Mouse")).not.toBeInTheDocument());
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
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
    render(<ProductsTable />);
    const table = await screen.findByRole("table");

    expect(within(table).getByRole("columnheader", { name: "Precio" })).toBeInTheDocument();
    expect(within(rowOf(table, "Laptop Stand")).getByText("Agotado")).toBeInTheDocument();
  });
});
