import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Permite que Vitest entienda JSX/TSX igual que Next.js.
  plugins: [react()],
  resolve: {
    // Mismo alias que en tsconfig.json: "@/stores/auth-store" -> "src/stores/auth-store".
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // jsdom simula un navegador (document, window, localStorage) dentro de Node.
    environment: "jsdom",
    // Habilita describe/it/expect globales y la limpieza automática de Testing Library.
    globals: true,
    // Se ejecuta antes de cada archivo de test (matchers, mocks globales y reseteo de estado).
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/app/**", "src/components/ui/**"],
    },
  },
});
