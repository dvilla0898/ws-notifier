import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/modules/auth/presentation/auth.store";
import { navigationState, routerMock } from "@/test/router-mock";

import { DashboardShell } from "../dashboard-shell";

function renderShell() {
  useAuthStore.setState({
    session: { token: "t", user: { id: "u1", username: "admin", name: "Admin", role: "admin" } },
  });
  navigationState.pathname = "/dashboard/products/";
  const user = userEvent.setup();
  render(
    <DashboardShell>
      <p>Contenido</p>
    </DashboardShell>,
  );
  return user;
}

/**
 * El menú de escritorio siempre existe (el CSS lo oculta en móvil).
 * El panel móvil (Sheet) solo existe en el DOM mientras está abierto.
 */
describe("<DashboardShell />", () => {
  it("marca como activa la sección actual (aunque la ruta termine en /)", () => {
    renderShell();

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("móvil: el botón ☰ abre un panel con la navegación, el usuario y salir", async () => {
    const user = renderShell();

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const panel = await screen.findByRole("dialog", { name: "Menu" });
    expect(within(panel).getByRole("link", { name: "Products" })).toBeInTheDocument();
    expect(within(panel).getByText("Admin")).toBeInTheDocument();
    expect(within(panel).getByRole("group", { name: "Language" })).toBeInTheDocument();
  });

  it("móvil: el panel se cierra con el botón ✕", async () => {
    const user = renderShell();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const panel = await screen.findByRole("dialog");

    await user.click(within(panel).getByRole("button", { name: "Close" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("móvil: cerrar sesión desde el panel redirige a /login", async () => {
    const user = renderShell();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const panel = await screen.findByRole("dialog");

    await user.click(within(panel).getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith("/login"));
    expect(useAuthStore.getState().session).toBeNull();
  });
});
