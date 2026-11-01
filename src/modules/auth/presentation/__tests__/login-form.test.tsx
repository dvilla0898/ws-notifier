import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/modules/auth/presentation/auth.store";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { setApiDelay } from "@/shared/infrastructure/delay";
import { routerMock } from "@/test/router-mock";

import { LoginForm } from "../components/login-form";

/**
 * Tests de componente con Testing Library: probamos como lo usaría una persona,
 * buscando por rol y texto visible (getByRole, getByLabelText), no por clases CSS.
 *
 *  - getBy...   -> el elemento DEBE estar ya.
 *  - queryBy... -> devuelve null si no está (para comprobar que NO aparece).
 *  - findBy...  -> espera hasta que aparezca (tras validar o llamar a la API).
 */
describe("<LoginForm />", () => {
  it("muestra el formulario y las credenciales de prueba", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("Demo credentials: admin / admin123")).toBeInTheDocument();
  });

  it("valida el campo al salir de él (blur), antes de enviar", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByLabelText("Username"));
    await user.tab(); // sale del campo sin escribir nada

    expect(await screen.findByText("This field is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveAttribute("aria-invalid", "true");
  });

  it("al enviar vacío marca ambos campos y no llama a la API", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findAllByText("This field is required.")).toHaveLength(2);
    expect(screen.getByLabelText("Username")).toHaveFocus(); // foco en el primer error
    expect(useAuthStore.getState().status).toBe("idle");
  });

  it("muestra el error de la API con credenciales incorrectas", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password.");
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("deshabilita el formulario mientras espera y luego redirige al panel", async () => {
    setApiDelay(50); // un poco de latencia para ver el estado "cargando"
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("button", { name: "Signing in..." })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toBeDisabled();

    await screen.findByRole("button", { name: "Sign in" });
    expect(routerMock.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("se muestra en español y permite cambiar de idioma", async () => {
    useLocaleStore.setState({ locale: "es" });
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "en" }));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
