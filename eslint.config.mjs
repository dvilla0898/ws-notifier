import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat permite usar la configuración de Next.js (formato antiguo) con ESLint 9.
const compat = new FlatCompat({ baseDirectory: __dirname });

/*
 * Reglas de dependencia de la arquitectura hexagonal.
 *
 *   presentation ──► application ──► domain
 *   infrastructure ──► application (implementa sus puertos)
 *
 * Las flechas apuntan siempre hacia adentro. Si alguien, por ejemplo, importa React
 * en el dominio o localStorage-adapter en un caso de uso, `pnpm lint` falla.
 * Convención: entre capas se importa SIEMPRE con el alias "@/".
 */
const FRAMEWORKS = {
  group: ["react", "react-dom", "react-*", "next", "next/*", "zustand", "zustand/*"],
  message: "Esta capa no puede depender de frameworks de UI ni de estado.",
};
const layer = (name) => ({
  group: [`@/modules/*/${name}`, `@/modules/*/${name}/**`, `@/shared/${name}`, `@/shared/${name}/**`],
  message: `Esta capa no puede importar la capa "${name}".`,
});
const CONTAINERS = {
  group: ["@/modules/*/*.container"],
  message: "Solo la presentación (o el app-shell) usa los contenedores.",
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/modules/*/domain/**/*.ts", "src/shared/domain/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            FRAMEWORKS,
            layer("application"),
            layer("infrastructure"),
            layer("presentation"),
            CONTAINERS,
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/*/application/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FRAMEWORKS, layer("infrastructure"), layer("presentation"), CONTAINERS] },
      ],
    },
  },
  {
    files: ["src/modules/*/infrastructure/**/*.ts", "src/shared/infrastructure/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FRAMEWORKS, layer("presentation"), CONTAINERS] },
      ],
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "coverage/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
