import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { setApiDelay } from "@/lib/mock-api/delay";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/locale-store";
import { routerMock } from "@/test/router-mock";

import { LoginForm } from "../login-form";

/**
 * Tests de componente con Testing Library.
 *
 * Filosofía: probar como lo usaría una persona. Buscamos elementos por su rol
 * y su texto visible (getByRole, getByLabelText), no por clases CSS ni ids.
 * userEvent simula escritura y clics reales (foco, teclado, etc.).
 *
 * Consultas:
 *  - getBy...   -> el elemento DEBE estar ya (si no, el test falla).
 *  - queryBy... -> devuelve null si no está (útil para comprobar que NO aparece).
 *  - findBy...  -> espera (async) hasta que aparezca; ideal tras llamadas a la API.
 */
describe("<LoginForm />", () => {
  async function fillAndSubmit(username: string, password: string) {
    const user = userEvent.setup();
    if (username) await user.type(screen.getByLabelText("Username"), username);
    if (password) await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
  }

  it("muestra el formulario con las credenciales de prueba", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Demo credentials: admin / admin123")).toBeInTheDocument();
  });

  it("pide ambos campos antes de llamar a la API", async () => {
    render(<LoginForm />);

    await fillAndSubmit("admin", "");

    expect(screen.getByRole("alert")).toHaveTextContent("Enter your username and password.");
    expect(useAuthStore.getState().status).toBe("idle"); // nunca se llamó a login()
  });

  it("muestra el error de la API con credenciales incorrectas", async () => {
    render(<LoginForm />);

    await fillAndSubmit("admin", "wrong");

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password.");
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("deshabilita el botón mientras espera la respuesta y luego redirige al panel", async () => {
    setApiDelay(50); // un poco de latencia para poder ver el estado "cargando"
    render(<LoginForm />);

    await fillAndSubmit("admin", "admin123");

    expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();

    // findBy espera a que la API responda y el botón vuelva a su texto normal.
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(routerMock.replace).toHaveBeenCalledWith("/dashboard");
    expect(useAuthStore.getState().user?.name).toBe("Admin");
  });

  it("se muestra en español si ese es el idioma elegido", () => {
    useLocaleStore.setState({ locale: "es" });

    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("permite cambiar de idioma con el selector", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "es" }));

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "es" })).toHaveAttribute("aria-pressed", "true");
  });
});
