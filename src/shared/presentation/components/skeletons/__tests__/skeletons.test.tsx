import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@/shared/presentation/ui/skeleton";

import { FormSkeleton, LoadingRegion, TableSkeleton } from "..";

describe("skeletons", () => {
  it("<Skeleton> es decorativo y solo anima si el usuario no pidió menos movimiento", () => {
    const { container } = render(<Skeleton className="h-4" />);
    const block = container.firstElementChild;

    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block).toHaveClass("motion-safe:animate-pulse");
  });

  it("<LoadingRegion> anuncia el estado a los lectores de pantalla", () => {
    render(
      <LoadingRegion label="Cargando productos...">
        <Skeleton />
      </LoadingRegion>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Cargando productos...");
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  it("<TableSkeleton> dibuja tarjetas (móvil/tablet) y filas (escritorio) con la forma pedida", () => {
    render(<TableSkeleton label="Loading" rows={3} columns={4} />);

    const cards = screen.getByTestId("skeleton-cards");
    const table = screen.getByTestId("skeleton-table");
    expect(cards).toHaveClass("lg:hidden");
    expect(table).toHaveClass("hidden", "lg:block");
    expect(cards.children).toHaveLength(3);
    // 1 encabezado + 3 filas, y cada una con 4 columnas
    expect(table.children).toHaveLength(4);
    expect(table.children[1].children).toHaveLength(4);
  });

  it("<FormSkeleton> dibuja un bloque por campo", () => {
    render(<FormSkeleton label="Loading product" fields={5} />);

    const status = screen.getByRole("status");
    expect(within(status).getAllByTestId("skeleton-field")).toHaveLength(5);
  });
});
