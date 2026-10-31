# ws-notifier · Panel administrativo (tutorial)

Panel administrativo **solo frontend** construido como proyecto de aprendizaje.
Tiene inicio de sesión, rutas protegidas y un módulo de **Productos** con CRUD completo.
No usa base de datos: una **API simulada** guarda los datos en `localStorage`
y tarda **1 segundo** en responder para imitar un servidor real.

> Credenciales de prueba: **`admin` / `admin123`**

---

## Índice

1. [Tecnologías y por qué](#1-tecnologías-y-por-qué)
2. [Primer arranque](#2-primer-arranque)
3. [Scripts disponibles](#3-scripts-disponibles)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Cómo funciona por dentro](#5-cómo-funciona-por-dentro)
6. [Tests: qué se prueba y cómo](#6-tests-qué-se-prueba-y-cómo)
7. [Flujo de trabajo con Pull Requests](#7-flujo-de-trabajo-con-pull-requests)
8. [Despliegue en Vercel](#8-despliegue-en-vercel)
9. [Ejercicios y próximos pasos](#9-ejercicios-y-próximos-pasos)

---

## 1. Tecnologías y por qué

| Pieza | Herramienta | Para qué la usamos |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) con `output: "export"` | Rutas por carpetas y build a un sitio **estático** (HTML + JS) |
| Lenguaje | **TypeScript** | Tipos para productos, usuarios y traducciones; errores en el editor, no en producción |
| Estilos | **Tailwind CSS v4** | Clases utilitarias (`flex`, `gap-4`, `text-sm`...) |
| Componentes | **shadcn/ui** | Botones, inputs, tarjetas y tablas accesibles. El código vive en `src/components/ui` y es tuyo |
| Estado global | **Zustand** | Stores pequeños para sesión, idioma y productos, sin `Provider` ni boilerplate |
| Datos | **JSON + localStorage** | Datos semilla en `src/data/*.json`; los cambios persisten al recargar |
| Idiomas | Diccionarios propios (inglés por defecto + español) | Traducciones tipadas, sin librerías extra |
| Tests | **Vitest** + **Testing Library** + **jsdom** | Tests rápidos de lógica, stores y componentes |
| Paquetes | **pnpm** | Instalaciones rápidas y un único `pnpm-lock.yaml` |
| CI | **GitHub Actions** | Lint, typecheck, tests y build en cada PR |
| Hosting | **Vercel** | Despliega automáticamente cada PR (preview) y `master` (producción) |

---

## 2. Primer arranque

Requisitos: **Node.js 20.19 o superior** (recomendado 22, ver `.nvmrc`) y **pnpm**.

```bash
# 1. Activa pnpm (viene con Node a través de Corepack)
corepack enable

# 2. Instala las dependencias
pnpm install

# 3. Arranca el servidor de desarrollo
pnpm dev
```

Abre <http://localhost:3000> e inicia sesión con `admin` / `admin123`.

> **Importante, la primera vez:** `pnpm install` crea el archivo `pnpm-lock.yaml`.
> **Súbelo al repositorio** (`git add pnpm-lock.yaml`). Ese archivo fija las versiones exactas
> de cada dependencia: sin él, la CI y Vercel podrían instalar versiones distintas a las tuyas,
> y Vercel no sabría que debe usar pnpm.

---

## 3. Scripts disponibles

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Genera el sitio estático en `out/` |
| `pnpm preview` | Sirve la carpeta `out/` para probar el build |
| `pnpm lint` | Revisa el código con ESLint |
| `pnpm typecheck` | Verifica los tipos de TypeScript sin compilar |
| `pnpm test` | Ejecuta todos los tests una vez |
| `pnpm test:watch` | Ejecuta los tests y los repite al guardar archivos |
| `pnpm test:coverage` | Tests + informe de cobertura en `coverage/` |

---

## 4. Estructura de carpetas

```
src/
├── app/                        # Rutas (cada carpeta con page.tsx es una URL)
│   ├── layout.tsx              # Layout raíz: <html>, estilos y <AppProviders>
│   ├── page.tsx                # "/"  -> redirige a /login o /dashboard
│   ├── login/page.tsx          # "/login"
│   └── dashboard/
│       ├── layout.tsx          # Protege /dashboard/* y dibuja menú + cabecera
│       ├── page.tsx            # "/dashboard" (inicio del panel)
│       └── products/
│           ├── page.tsx        # "/dashboard/products" (listado)
│           ├── new/page.tsx    # "/dashboard/products/new"
│           └── edit/page.tsx   # "/dashboard/products/edit?id=p1"
├── components/
│   ├── ui/                     # Componentes base de shadcn/ui
│   ├── auth/                   # LoginForm, AuthGuard
│   ├── layout/                 # DashboardShell, PageHeader, LanguageSwitcher
│   ├── products/               # ProductsTable, ProductForm, EditProductView
│   ├── feedback/               # LoadingState
│   └── providers/              # AppProviders (rehidratación de stores)
├── stores/                     # Stores de Zustand (auth, products, locale)
├── lib/
│   ├── mock-api/               # API simulada: delay, errores, "base de datos"
│   ├── validation/             # Reglas de validación de productos
│   └── utils.ts                # cn(): helper de clases de shadcn
├── i18n/                       # Idiomas: config, diccionarios y hooks
├── data/                       # Datos semilla (JSON)
├── types/                      # Tipos compartidos (User, Product...)
└── test/                       # Utilidades de test (router falso, reseteo de estado)
```

Los tests viven junto al código que prueban, en carpetas `__tests__/`.

---

## 5. Cómo funciona por dentro

### 5.1 El recorrido de una acción

Todas las acciones siguen el mismo camino. Por ejemplo, al eliminar un producto:

```
 ProductsTable          useProductsStore           products-api              localStorage
 (componente)           (Zustand)                  (API simulada)            ("base de datos")
      │  deleteProduct(id)   │                           │                          │
      │─────────────────────>│ set({ deletingId: id })   │                          │
      │   (fila con spinner) │──────────────────────────>│ await delay() ⏱ 1 s      │
      │                      │                           │─────────────────────────>│ escribe
      │                      │<──────────────────────────│                          │
      │                      │ quita el producto de items│                          │
      │<─────────────────────│ return { ok: true }       │                          │
```

Cada capa tiene **una sola responsabilidad**:

- **Componente**: muestra datos y reacciona a clics. No sabe de dónde vienen los datos.
- **Store (Zustand)**: guarda el estado de la UI (`items`, `status`, `errorCode`...) y llama a la API.
- **API simulada**: valida, aplica las reglas de negocio (SKU único) y persiste.
  Si mañana hay un backend real, **solo cambia esta capa** (por llamadas `fetch`).

### 5.2 La API simulada (`src/lib/mock-api`)

- `delay.ts`: `await delay()` espera **1000 ms** antes de cada respuesta. Así puedes ver los
  estados de carga ("Loading products...", "Signing in...", botones deshabilitados).
- `storage.ts`: lee y escribe colecciones en `localStorage` (`ws-notifier:db:products`).
  La primera vez se inicializa con `src/data/products.json`.
- `errors.ts`: la API lanza `ApiError` con un **código** (`SKU_TAKEN`, `NOT_FOUND`...).
  La UI nunca muestra el mensaje técnico: traduce el código al idioma activo.
- `auth-api.ts` y `products-api.ts`: cada función equivale a un endpoint REST
  (`listProducts` → `GET /products`, `createProduct` → `POST /products`, etc.).

**Para empezar de cero** (volver a los datos semilla): en las herramientas de desarrollo del
navegador → *Application* → *Local Storage*, borra las claves que empiezan por `ws-notifier:`.

### 5.3 Autenticación

1. `LoginForm` llama a `useAuthStore.getState().login(usuario, contraseña)`.
2. El store pasa a `status: "loading"`, espera a la API y guarda `user` + `token`.
3. El middleware `persist` de Zustand guarda la sesión en `localStorage` (`ws-notifier:session`),
   así que **recargar la página no cierra la sesión**.
4. `src/app/dashboard/layout.tsx` envuelve todo el panel en `AuthGuard`: si no hay token,
   redirige a `/login`.

> ⚠️ Esto es una simulación educativa. Las contraseñas en un JSON del frontend y la protección de
> rutas en el navegador **no son seguridad real**: con un backend, el servidor debe validar el
> token en cada petición.

**¿Por qué existe `AppProviders`?** El sitio se genera como HTML estático en el build, donde no
existe `localStorage`. Si los stores leyeran `localStorage` al cargar, el HTML del servidor y el
primer render del navegador no coincidirían (error de hidratación de React). Por eso los stores
usan `skipHydration: true` y `AppProviders` los rehidrata en un `useEffect`, mostrando un loader
mientras tanto.

### 5.4 Idiomas (inglés y español)

- `src/i18n/dictionaries/en.ts` define todos los textos; `es.ts` está tipado con `Dictionary`,
  así que **TypeScript marca error si falta o sobra una clave**.
- En un componente: `const t = useTranslations();` y luego `t.products.title`.
- Los textos con variables son funciones: `t.dashboard.welcome("Ana")`.
- El idioma elegido se guarda en `localStorage` (`ws-notifier:locale`). Por defecto, inglés.

### 5.5 Módulo de productos

- **Listado** (`ProductsTable`): carga la lista al montarse, con búsqueda por nombre/SKU/categoría,
  precio formateado como moneda, aviso de "agotado" y eliminación con confirmación en la fila.
- **Formulario** (`ProductForm`): sirve para crear y editar. Valida antes de enviar (mensajes por
  campo), acepta coma o punto decimal y muestra los errores de la API (p. ej. SKU repetido).
- **Edición**: la URL es `/dashboard/products/edit?id=p1`. No usamos `/products/[id]` porque con
  `output: "export"` las rutas dinámicas deben conocerse en el build, y nuestros productos se crean
  en el navegador.
- **Validación compartida** (`src/lib/validation/product.ts`): la usan el formulario *y* la API,
  igual que en una app real donde el servidor nunca confía en el cliente.

### 5.6 Agregar más componentes de shadcn/ui

El archivo `components.json` ya está configurado, así que puedes agregar componentes oficiales:

```bash
pnpm dlx shadcn@latest add dialog select
```

Se copiarán en `src/components/ui/`. Nota: `card.tsx` está adaptado para que `CardTitle` sea un
`<h2>` (mejor accesibilidad).

---

## 6. Tests: qué se prueba y cómo

```bash
pnpm test           # todos, una vez
pnpm test:watch     # modo observador
pnpm test:coverage  # con informe de cobertura
pnpm test login     # solo los archivos cuyo nombre contiene "login"
```

### 6.1 Herramientas

- **Vitest**: ejecuta los tests (`describe`, `it`, `expect`, `vi.fn()`...). Es compatible con la
  sintaxis de Jest pero usa la configuración de Vite, por eso es muy rápido.
- **jsdom**: simula un navegador dentro de Node (`document`, `window`, `localStorage`).
- **Testing Library** (`@testing-library/react`): renderiza componentes y los busca **como lo haría
  una persona**: por rol (`button`, `heading`, `alert`), por etiqueta (`getByLabelText("Price")`) o
  por texto visible. Nunca por clases CSS.
- **user-event**: simula escritura y clics reales (foco, teclado, eventos en orden).
- **jest-dom**: matchers legibles como `toBeInTheDocument()`, `toBeDisabled()`, `toHaveValue()`.

### 6.2 La configuración, paso a paso

- `vitest.config.mts`: entorno `jsdom`, alias `@/` igual que en `tsconfig.json`, archivo de setup y
  qué entra en la cobertura.
- `vitest.setup.ts` (se ejecuta antes de cada archivo de test):
  1. Carga los matchers de jest-dom.
  2. **Reemplaza `next/navigation`** por un router falso (`src/test/router-mock.ts`). Fuera de
     Next.js no existe un router real; con el falso podemos comprobar
     `expect(routerMock.replace).toHaveBeenCalledWith("/dashboard")`.
  3. Reemplaza `next/link` por un `<a>` normal.
  4. Antes de **cada** test llama a `resetAppState()`: stores en su estado inicial, `localStorage`
     vacío y **latencia 0** (para que los tests no tarden 1 s por llamada).

> **Regla de oro:** cada test debe poder ejecutarse solo y en cualquier orden. Por eso se
> resetea todo antes de cada uno.

### 6.3 Qué prueba cada archivo

| Archivo | Tipo | Qué verifica |
| --- | --- | --- |
| `lib/mock-api/__tests__/delay.test.ts` | Unitario | Que la API espera **exactamente 1 s**, usando *fake timers* (`vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()`) para no esperar de verdad |
| `lib/mock-api/__tests__/auth-api.test.ts` | Unitario | Login correcto devuelve usuario + token y **nunca la contraseña**; credenciales malas → `INVALID_CREDENTIALS` |
| `lib/mock-api/__tests__/products-api.test.ts` | Unitario | CRUD completo, persistencia en `localStorage`, SKU único (sin importar mayúsculas), `NOT_FOUND` y validación del lado de la "API" |
| `lib/validation/__tests__/product.test.ts` | Unitario | Cada regla de validación con `it.each` (una tabla de casos en un solo test) |
| `stores/__tests__/auth-store.test.ts` | Store | Estados `loading` → `idle`/`error`, sesión guardada por `persist`, logout |
| `stores/__tests__/products-store.test.ts` | Store | `fetch`, crear, editar y eliminar actualizan `items`; los errores vuelven como `{ ok: false, errorCode }` |
| `i18n/__tests__/dictionaries.test.ts` | Unitario | Inglés y español tienen las mismas claves; traducción de códigos de error |
| `components/auth/__tests__/login-form.test.tsx` | Componente | Campos obligatorios, error de credenciales, botón deshabilitado mientras carga, redirección y cambio de idioma |
| `components/auth/__tests__/auth-guard.test.tsx` | Componente | Sin sesión redirige a `/login`; con sesión muestra el contenido |
| `components/products/__tests__/products-table.test.tsx` | Componente | Estado de carga, tabla, moneda, "agotado", búsqueda, confirmación y eliminación, lista vacía, español |
| `components/products/__tests__/product-form.test.tsx` | Componente | Errores por campo, conversión de datos al enviar, error de la API, modo edición y cancelar |

### 6.4 Patrones que vas a ver en los tests

**AAA (Arrange, Act, Assert)**: preparar → ejecutar → verificar.

```ts
it("login incorrecto: no inicia sesión", async () => {
  // Arrange: (el estado ya está limpio gracias al setup)
  // Act
  const success = await useAuthStore.getState().login("admin", "bad-password");
  // Assert
  expect(success).toBe(false);
});
```

**`getBy` / `queryBy` / `findBy`**:

| Consulta | Si no encuentra el elemento | Úsala cuando... |
| --- | --- | --- |
| `getByRole(...)` | Falla el test | El elemento ya debe estar en pantalla |
| `queryByText(...)` | Devuelve `null` | Quieres comprobar que algo **no** aparece |
| `await findByRole(...)` | Espera hasta ~1 s y luego falla | El elemento aparece después de una llamada a la API |

**Probar un store sin componentes**: `useProductsStore.getState().fetchProducts()` para ejecutar
acciones y `useProductsStore.setState({...})` para preparar un escenario (por ejemplo, simular una
sesión iniciada en `auth-guard.test.tsx`).

**Funciones falsas (`vi.fn()`)**: en `product-form.test.tsx` el `onSubmit` es falso; así probamos
el formulario aislado y verificamos con qué datos lo llamó (`toHaveBeenCalledWith`).

**Fake timers**: en `delay.test.ts` controlamos el reloj para probar el segundo de espera en
milisegundos reales.

---

## 7. Flujo de trabajo con Pull Requests

La rama principal es `master`. **No se hace push directo a `master`**: cada cambio entra por un PR.

```bash
git checkout master && git pull                  # 1. parte de la última versión
git checkout -b feature/nombre-del-cambio        # 2. crea una rama
# ... cambios ...
pnpm lint && pnpm typecheck && pnpm test         # 3. verifica en local
git add . && git commit -m "feat: descripción"   # 4. commit
git push -u origin feature/nombre-del-cambio     # 5. sube la rama
# 6. abre el PR en GitHub -> se ejecuta la CI y Vercel crea una preview
# 7. si todo está en verde: "Squash and merge" y borra la rama
```

**CI (`.github/workflows/ci.yml`)**: en cada PR y en cada push a `master` ejecuta
`lint` → `typecheck` → `test` → `build`. Si algo falla, el PR queda en rojo.

**Proteger `master`** (GitHub → *Settings* → *Rules* → *Rulesets* → *New branch ruleset*):
apunta a `master` y activa *Require a pull request before merging* (aprobaciones: 0 si trabajas
solo), *Require status checks to pass* (elige el check **"Lint, typecheck, tests y build"**),
*Block force pushes* y *Restrict deletions*.
Nota: en repositorios **privados**, esta función requiere un plan de pago de GitHub.

---

## 8. Despliegue en Vercel

Vercel despliega con su integración de Git; **no** se usa GitHub Actions para desplegar.

1. Asegúrate de que `pnpm-lock.yaml` está en el repo (así Vercel usa pnpm).
2. En <https://vercel.com/new> importa el repositorio `ws-notifier`.
3. Vercel detecta **Next.js** automáticamente; no hace falta cambiar nada (el build genera `out/`).
4. Desde ese momento:
   - cada **PR** obtiene una URL de *preview* para probar los cambios;
   - cada merge a **`master`** se publica en producción.

Vercel **no** ejecuta los tests: de eso se encarga la CI. Con la protección de rama activa, a
`master` solo llega código con los checks en verde.

---

## 9. Ejercicios y próximos pasos

- **Fase 2 – Ventas**: crea `src/app/dashboard/sales/`, una API `sales-api.ts`, un store y sus
  tests siguiendo el mismo patrón que productos. Activa el elemento "Sales" en `NAV_ITEMS`
  (`src/components/layout/dashboard-shell.tsx`).
- Agrega un tercer idioma: crea su diccionario y añádelo a `SUPPORTED_LOCALES`.
- Agrega paginación u ordenamiento por columnas a la tabla de productos (y su test).
- Cambia la latencia en `src/lib/mock-api/delay.ts` para ver cómo se comporta la UI con una red lenta.
- Sustituye la API simulada por un backend real cambiando solo `src/lib/mock-api/*`.

- Practiqué el flujo de PR 🎉💅💅
- Practiqué el flujo de PR parte B🎉🎉🎉