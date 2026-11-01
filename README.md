# ws-notifier · Panel administrativo (tutorial)

Panel administrativo **solo frontend** construido como proyecto de aprendizaje.
Tiene inicio de sesión, rutas protegidas y un módulo de **Productos** con CRUD completo,
organizado con **arquitectura hexagonal (Clean Architecture)**, **módulos** y
**un caso de uso por cada acción**.

No usa base de datos: una **API simulada** guarda los datos en `localStorage`
y tarda **1 segundo** en responder para imitar un servidor real.

> Credenciales de prueba: **`admin` / `admin123`**

---

## Índice

1. [Tecnologías y por qué](#1-tecnologías-y-por-qué)
2. [Primer arranque](#2-primer-arranque)
3. [Scripts disponibles](#3-scripts-disponibles)
4. [Arquitectura](#4-arquitectura)
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
| Lenguaje | **TypeScript** | Tipos para entidades, value objects, DTOs y traducciones |
| Arquitectura | **Hexagonal / Clean Architecture** | Dominio aislado, un caso de uso por acción, adaptadores intercambiables |
| Estilos | **Tailwind CSS v4** | Clases utilitarias (`flex`, `gap-4`, `text-sm`...) |
| Componentes | **shadcn/ui** | Botones, inputs, tarjetas y tablas accesibles. El código vive en `src/shared/presentation/ui` y es tuyo |
| Formularios | **react-hook-form** | Estado del formulario y validación al salir del campo, con las reglas del dominio |
| Estado de pantalla | **Zustand** | Stores pequeños por módulo: cargando, lista, errores |
| Datos | **JSON + localStorage** | Datos semilla en `src/modules/*/infrastructure/seed/*.json`; los cambios persisten al recargar |
| Idiomas | Diccionarios propios (inglés por defecto + español) | Traducciones tipadas, sin librerías extra |
| Tests | **Vitest** + **Testing Library** + **jsdom** | Tests de value objects, casos de uso, adaptadores y componentes |
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

## 4. Arquitectura

### 4.1 La idea en una frase

**El negocio (dominio y casos de uso) no sabe nada de React, Next.js, Zustand ni localStorage.**
Todo lo técnico se "enchufa" desde afuera a través de **puertos** (interfaces) y **adaptadores**
(implementaciones). Por eso se llama *hexagonal* o *puertos y adaptadores*.

```
              ┌──────────────── presentation ────────────────┐
              │  Componentes React + store de Zustand         │
              └──────────────────────┬────────────────────────┘
                                     │ productsContainer.createProduct.execute(input)
                                     ▼
┌───────────────────────────── application ─────────────────────────────┐
│  CreateProductUseCase ──usa──► «interface» CreateProductRepository    │
│  DeleteProductUseCase ──usa──► «interface» DeleteProductRepository    │
│  ...un caso de uso por acción, cada uno con SU puerto                  │
└──────────────┬─────────────────────────────────────▲──────────────────┘
               │ usa                                 │ implementa (todos los puertos)
               ▼                                     │
┌────────── domain ──────────┐     ┌──────────── infrastructure ─────────────┐
│ Product · Sku · Price      │     │ LocalStorageProductRepository           │
│ Stock · ProductErrors      │     │ (un solo adaptador por módulo)           │
└────────────────────────────┘     └─────────────────────────────────────────┘

Las dependencias siempre apuntan HACIA ADENTRO (hacia domain).
```

| Capa | Qué contiene | Puede importar |
| --- | --- | --- |
| **domain** | Entidades, value objects, errores de negocio. Código puro | Solo `shared/domain` |
| **application** | Casos de uso, sus puertos y los DTOs | `domain` |
| **infrastructure** | Adaptadores: localStorage, API simulada, datos semilla | `application` (puertos) y `domain` |
| **presentation** | Componentes React, stores de Zustand, resolvers de formularios | Todo lo anterior y el contenedor del módulo |

Estas reglas las **vigila ESLint** (`eslint.config.mjs`, regla `no-restricted-imports`):
si importas React en el dominio o un adaptador en un caso de uso, `pnpm lint` falla.

### 4.2 Estructura de carpetas

```
src/
├── app/                          # Rutas de Next.js: solo conectan, sin lógica
├── app-shell/                    # Lo que une módulos: menú del panel y AppProviders
├── modules/
│   ├── auth/
│   │   ├── domain/               # Session, User, value objects (Username, Password, Credentials), AuthErrors
│   │   ├── application/use-cases/
│   │   │   ├── login/                # login.port.ts + login.use-case.ts + test
│   │   │   ├── logout/
│   │   │   └── get-current-session/
│   │   ├── infrastructure/       # MockAuthGateway, LocalStorageSessionStore, seed/users.json
│   │   ├── presentation/         # LoginForm, AuthGuard, auth.store, login-form.resolver
│   │   └── auth.container.ts     # ⚙️ conecta adaptadores con casos de uso
│   └── products/
│       ├── domain/               # Product (entidad), Sku, Price, Stock, ProductName, Category, ProductErrors
│       ├── application/
│       │   ├── product.dto.ts
│       │   └── use-cases/
│       │       ├── create-product/   # create-product.port.ts + .use-case.ts + .test.ts
│       │       ├── update-product/
│       │       ├── delete-product/
│       │       ├── get-product/
│       │       ├── list-products/
│       │       └── search-products/
│       ├── infrastructure/       # LocalStorageProductRepository, InMemoryProductRepository, seed/products.json
│       ├── presentation/         # ProductsTable, ProductForm, EditProductView, products.store, product-form.resolver
│       └── products.container.ts
├── shared/
│   ├── domain/                   # Result, AppError (respuesta y errores centralizados)
│   ├── infrastructure/           # delay, simulateApiCall, LocalStorageCollection
│   ├── i18n/                     # Diccionarios, useTranslations, translateError, locale.store
│   ├── presentation/             # ui/ (shadcn), components/ (FormField, PageHeader...), forms/
│   └── lib/utils.ts              # cn(): helper de clases
└── test/                         # Router falso y reseteo de estado para los tests
```

### 4.3 Decisiones de diseño

**Un puerto por caso de uso, un adaptador por módulo.** Cada caso de uso declara en su
`*.port.ts` *solo* lo que necesita (principio de segregación de interfaces). Un único
adaptador por módulo implementa todos esos puertos, así "cómo se guarda un producto" vive
en un solo archivo y no se duplica.

```ts
// create-product.port.ts: solo lo que necesita crear un producto
export interface CreateProductRepository {
  nextId(): string;
  existsBySku(sku: Sku): Promise<boolean>;
  save(product: Product): Promise<void>;
}

// local-storage-product.repository.ts: un adaptador, todos los puertos
export class LocalStorageProductRepository
  implements CreateProductRepository, UpdateProductRepository, DeleteProductRepository, /* ... */ {}
```

**Un contenedor por módulo.** `products.container.ts` y `auth.container.ts` son la *raíz de
composición*: el único lugar que decide qué adaptador usa cada caso de uso. Cuando llegue
*ventas*, tendrá su propio `sales.container.ts`.

**Respuesta centralizada: `Result` + `AppError`.** Ningún caso de uso lanza excepciones hacia
la UI; todos devuelven `{ ok: true, value }` o `{ ok: false, error }`. El `AppError` lleva un
`code` (que la UI traduce) y, si es de validación, el `field` y el `reason`.

**Value objects.** `Sku`, `Price`, `Stock`, `ProductName`, `Category`, `Username` y `Password`
tienen constructor privado y se crean con `X.create(valor)`, que devuelve un `Result`.
Si existe un `Price`, es mayor que 0: nadie tiene que volver a validarlo.

**La latencia es infraestructura.** Ni los casos de uso ni los repositorios esperan: el contenedor
envuelve cada caso de uso con `simulateApiCall`, que espera 1 s **una vez por acción** y convierte
cualquier excepción inesperada en `fail(AppError UNKNOWN)`.

**Proporcionalidad.** Las lecturas (`list`, `get`, `search`) son casos de uso deliberadamente
delgados: no tienen reglas que aplicar. Donde la arquitectura "paga" es en las escrituras con
reglas (SKU único, validaciones) y, sobre todo, en módulos con lógica de negocio real, como lo será
*ventas*. En un CRUD puro de producción, una versión más simple también sería válida.

### 4.4 Dónde buscar cuando hay un bug

| Síntoma | Archivo |
| --- | --- |
| "Acepta un SKU inválido" | `modules/products/domain/value-objects/sku.ts` |
| "Deja crear dos productos con el mismo SKU" | `modules/products/application/use-cases/create-product/create-product.use-case.ts` |
| "No se guarda al recargar la página" | `modules/products/infrastructure/local-storage-product.repository.ts` |
| "El mensaje de error sale en el idioma equivocado" | `shared/i18n/dictionaries/*.ts` |
| "El formulario no marca el campo" | `modules/products/presentation/forms/product-form.resolver.ts` |
| "Se usa el adaptador equivocado" o "no hay latencia" | `modules/products/products.container.ts` |

### 4.5 Cómo agregar un caso de uso nuevo (receta)

Ejemplo: "duplicar un producto".

1. **Dominio**: ¿hay una regla nueva? Agrégala a la entidad o a un value object (con su test).
2. **Puerto**: crea `use-cases/duplicate-product/duplicate-product.port.ts` con solo los métodos que necesitas.
3. **Caso de uso**: `duplicate-product.use-case.ts`, que recibe el puerto por constructor y devuelve un `Result`.
4. **Test**: `duplicate-product.use-case.test.ts` con `InMemoryProductRepository` o un fake.
5. **Adaptador**: añade el puerto al `implements` de `LocalStorageProductRepository` (y al de memoria).
6. **Contenedor**: `duplicateProduct: simulateApiCall(new DuplicateProductUseCase(repository))`.
7. **Presentación**: una acción en `products.store.ts` y el botón en el componente.

---

## 5. Cómo funciona por dentro

### 5.1 El recorrido de una acción: crear un producto

```
ProductForm ─► products.store ─► productsContainer.createProduct ─► CreateProductUseCase
 (valida con      (estado de        (simulateApiCall:                  │ Product.create() → value objects
  el resolver)     pantalla)          espera 1 s)                      │ repository.existsBySku()
                                                                       │ repository.save()
                                                                       ▼
                                                     LocalStorageProductRepository → localStorage
```

1. **`ProductForm`** valida cada campo con `productFormResolver`, que llama a los value objects.
2. Al enviar, la página llama a **`products.store.createProduct(input)`**.
3. El store llama al **contenedor**, que espera 1 s (`simulateApiCall`) y ejecuta el **caso de uso**.
4. El caso de uso crea la **entidad** (`Product.create`), comprueba el SKU único con su **puerto**
   y guarda.
5. Devuelve un **`Result`**: el store actualiza la lista; si hay error, el formulario lo muestra
   **debajo del campo afectado** (por ejemplo, SKU repetido) o como error general.

### 5.2 Validación de formularios (react-hook-form + dominio)

Hay **dos niveles** de validación y **una sola fuente de reglas**:

| Nivel | Dónde | Para qué |
| --- | --- | --- |
| Formulario | `presentation/forms/*.resolver.ts` | Avisar mientras se escribe, sin esperar 1 s a la API |
| Dominio | `domain/value-objects/*.ts` | Garantizar que nada inválido entra al sistema |

El *resolver* de react-hook-form **no define reglas propias** (como haría un esquema de zod):
pregunta a los value objects. Si mañana el SKU admite 25 caracteres, se cambia en `sku.ts` y el
formulario se actualiza solo.

```ts
const fieldRules = {
  sku: (raw) => Sku.create(raw),
  price: (raw) => Price.create(parseNumber(raw)),
  // ...
};
```

Comportamiento (`mode: "onTouched"`):
- cada campo se valida **al salir de él**;
- un campo con error se **revalida mientras lo corriges**;
- al enviar se valida todo y el **foco va al primer campo con error**.

Los errores se guardan como *código* (`required`, `SKU_TAKEN`...) y se traducen al mostrarse,
así cambian de idioma aunque el formulario esté abierto.

### 5.3 Autenticación

- **login**: `Credentials.create()` valida, `MockAuthGateway` comprueba el usuario de
  `seed/users.json` y `LocalStorageSessionStore` guarda la sesión (`ws-notifier:session`).
- **get-current-session**: al abrir la app, `AppProviders` lo ejecuta para recuperar la sesión.
  Mientras tanto muestra un loader, así ninguna página decide "no hay sesión" antes de leerla.
- **logout**: avisa a la "API" y borra la sesión.
- **AuthGuard** protege `/dashboard/*` y redirige a `/login` si no hay sesión.

> ⚠️ Simulación educativa: contraseñas en un JSON del frontend y protección de rutas en el
> navegador **no son seguridad real**. Con un backend, el servidor valida el token en cada petición.

### 5.4 Datos simulados

- Cada colección se guarda en `localStorage` como `ws-notifier:db:<colección>`
  (`LocalStorageCollection`). La primera lectura usa los datos semilla.
- **Para empezar de cero**: en las herramientas del navegador → *Application* → *Local Storage*,
  borra las claves que empiezan por `ws-notifier:`.
- **Latencia**: cambia `DEFAULT_API_DELAY_MS` en `src/shared/infrastructure/delay.ts`.

### 5.5 Idiomas

- `src/shared/i18n/dictionaries/en.ts` define todos los textos; `es.ts` está tipado con
  `Dictionary`, así que TypeScript marca error si falta o sobra una clave.
- En un componente: `const t = useTranslations();` y luego `t.products.title`.
- `translateError(t, appError)` y `translateFieldError(t, fieldError)` traducen errores por código.

### 5.6 Módulo de productos

- **Listado**: carga con *list-products*, busca con *search-products* (300 ms después de la última
  tecla) y elimina con confirmación usando *delete-product*.
- **Edición**: `/dashboard/products/edit?id=p1`. No usamos `/products/[id]` porque con
  `output: "export"` las rutas dinámicas deben conocerse en el build.

### 5.7 Agregar componentes de shadcn/ui

`components.json` ya apunta a la nueva estructura:

```bash
pnpm dlx shadcn@latest add dialog select
```

Se copiarán en `src/shared/presentation/ui/`.

---

## 6. Tests: qué se prueba y cómo

```bash
pnpm test           # todos, una vez
pnpm test:watch     # modo observador
pnpm test:coverage  # con informe de cobertura
pnpm test create-product   # solo los archivos cuyo nombre contiene "create-product"
```

### 6.1 Herramientas

- **Vitest**: ejecuta los tests (`describe`, `it`, `expect`, `vi.fn()`...).
- **jsdom**: simula un navegador dentro de Node (`document`, `window`, `localStorage`).
- **Testing Library**: renderiza componentes y los busca como una persona (por rol, etiqueta o texto).
- **user-event**: simula escritura, clics y tabulaciones reales (necesario para probar el *blur*).
- **jest-dom**: matchers como `toBeInTheDocument()`, `toBeDisabled()`, `toHaveFocus()`.

### 6.2 La configuración

- `vitest.config.mts`: entorno `jsdom`, alias `@/` y archivo de setup.
- `vitest.setup.ts`, antes de cada archivo de test:
  1. carga los matchers de jest-dom;
  2. reemplaza `next/navigation` por un router falso (`src/test/router-mock.ts`);
  3. reemplaza `next/link` por un `<a>`;
  4. antes de **cada** test llama a `resetAppState()`: stores limpios, `localStorage` vacío y
     **latencia 0**.

### 6.3 La pirámide de tests de este proyecto

```
              ▲  Componentes (LoginForm, ProductForm, ProductsTable, AuthGuard)
             ▲▲▲ Stores (integración: store → contenedor → caso de uso → adaptador real)
           ▲▲▲▲▲ Adaptadores (localStorage, gateway simulado)
        ▲▲▲▲▲▲▲▲ Casos de uso (con InMemoryProductRepository o fakes)
     ▲▲▲▲▲▲▲▲▲▲▲ Dominio (value objects y entidad: funciones puras)
```

Cuanto más abajo, más tests, más rápidos y más fáciles de escribir. Es la gran ventaja de la
arquitectura: **la lógica se prueba sin React, sin localStorage y sin esperar**.

### 6.4 Qué prueba cada archivo

| Archivo | Capa | Qué verifica |
| --- | --- | --- |
| `shared/domain/__tests__/result.test.ts` | Compartido | `ok`/`fail` y el *narrowing* de TypeScript |
| `shared/infrastructure/__tests__/simulated-api-call.test.ts` | Compartido | La espera de **exactamente 1 s** (fake timers) y que una excepción se convierte en `UNKNOWN` |
| `shared/i18n/__tests__/dictionaries.test.ts` | Compartido | Mismas claves en inglés y español; traducción de `AppError` |
| `products/domain/__tests__/value-objects.test.ts` | Dominio | Reglas de `Sku`, `Price`, `Stock`, `ProductName`, `Category` con `it.each` |
| `products/domain/__tests__/product.entity.test.ts` | Dominio | Creación, inmutabilidad de `update()`, `matches()`, registros corruptos |
| `products/application/use-cases/*/*.use-case.test.ts` | Aplicación | Cada caso de uso: camino feliz, SKU repetido, `PRODUCT_NOT_FOUND`, validación |
| `products/infrastructure/__tests__/local-storage-product.repository.test.ts` | Infraestructura | Semilla, insertar, *upsert*, `existsBySku` con exclusión, eliminar |
| `products/presentation/__tests__/products.store.test.ts` | Presentación | Estados `loading` → `success`, búsqueda, crear y eliminar de punta a punta |
| `products/presentation/__tests__/product-form.test.tsx` | Presentación | Validación al salir del campo, al revalidar y al enviar; foco; errores de la API por campo |
| `products/presentation/__tests__/products-table.test.tsx` | Presentación | Carga, moneda, agotado, búsqueda con debounce, eliminar, lista vacía, español |
| `auth/domain/__tests__/credentials.test.ts` | Dominio | `Username`, `Password` y `Credentials` |
| `auth/application/use-cases/*/*.use-case.test.ts` | Aplicación | login, logout y get-current-session con fakes de sus puertos |
| `auth/infrastructure/__tests__/auth-adapters.test.ts` | Infraestructura | Gateway simulado (sin exponer la contraseña) y sesión en localStorage |
| `auth/presentation/__tests__/auth.store.test.ts` | Presentación | Login, error, restaurar sesión tras "recargar", logout |
| `auth/presentation/__tests__/login-form.test.tsx` | Presentación | Validación al salir del campo, foco, error de credenciales, carga, idioma |
| `auth/presentation/__tests__/auth-guard.test.tsx` | Presentación | Redirige sin sesión; muestra el contenido con sesión |

### 6.5 Patrones que vas a ver

**Fakes de un puerto.** Como cada caso de uso tiene su puerto pequeño, el fake se escribe en
el propio test con 2 o 3 métodos:

```ts
const fake: CreateProductRepository = { nextId: () => "id", existsBySku: vi.fn(), save: vi.fn() };
const result = await new CreateProductUseCase(fake).execute({ ...input, price: 0 });
expect(fake.save).not.toHaveBeenCalled(); // el dominio rechazó el precio antes de guardar
```

**`getBy` / `queryBy` / `findBy`**: `getBy` exige que el elemento esté ya; `queryBy` devuelve
`null` (para comprobar que **no** aparece); `await findBy` espera a que aparezca (tras validar
o tras la API).

**Fake timers** (`simulated-api-call.test.ts`): controlamos el reloj para probar el segundo de
espera sin esperarlo.

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

- **Fase 2 – Ventas**: crea `src/modules/sales/` con la misma estructura (dominio, casos de uso con
  su puerto, adaptador, `sales.container.ts`, presentación) y activa "Sales" en `NAV_ITEMS`
  (`src/app-shell/dashboard-shell.tsx`). Registrar una venta descontará stock: buen momento para
  practicar un **servicio de dominio** o **eventos de dominio** en lugar de que un caso de uso llame a otro.
- Crea un `HttpProductRepository` (aunque apunte a una API falsa) y cámbialo en `products.container.ts`:
  ningún caso de uso ni componente debería cambiar.
- Agrega un caso de uso "duplicar producto" siguiendo la receta de la sección 4.5.
- Agrega un tercer idioma: crea su diccionario y añádelo a `SUPPORTED_LOCALES`.
- Rompe a propósito una regla de capas (importa React en `domain/`) y mira cómo falla `pnpm lint`.

- Practiqué el flujo de PR 🎉💅💅
- Practiqué el flujo de PR parte B🎉🎉🎉
