import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/stores/auth-store";
import { routerMock } from "@/test/router-mock";

import { AuthGuard } from "../auth-guard";

describe("<AuthGuard />", () => {
  it("sin sesión: no muestra el contenido privado y redirige a /login", () => {
    render(
      <AuthGuard>
        <p>Contenido privado</p>
      </AuthGuard>,
    );

    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(routerMock.replace).toHaveBeenCalledWith("/login");
  });

  it("con sesión: muestra el contenido y no redirige", () => {
    // Arrange: simulamos una sesión iniciada escribiendo directamente en el store.
    useAuthStore.setState({
      token: "mock-token",
      user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
    });

    render(
      <AuthGuard>
        <p>Contenido privado</p>
      </AuthGuard>,
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
