/**
 * Diccionario en inglés (idioma por defecto).
 *
 * Es un objeto TypeScript normal, así que `t.products.title` tiene autocompletado
 * y el compilador avisa si falta una clave. Los textos con variables son funciones.
 * El tipo `Dictionary` obliga a que es.ts tenga exactamente la misma forma.
 */
export const en = {
  common: {
    appName: "WS Notifier",
    loading: "Loading...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    retry: "Retry",
    language: "Language",
    comingSoon: "Soon",
  },
  login: {
    title: "Sign in",
    subtitle: "Use your administrator account to access the panel.",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    demoHint: "Demo credentials: admin / admin123",
  },
  nav: {
    main: "Main navigation",
    dashboard: "Dashboard",
    products: "Products",
    sales: "Sales",
    logout: "Log out",
    loggingOut: "Logging out...",
  },
  dashboard: {
    welcome: (name: string) => `Welcome, ${name}`,
    subtitle: "Choose a module to get started.",
    productsDescription: "Manage your catalog: create, edit and delete products.",
    salesDescription: "Sales tracking will be available in phase 2.",
    open: "Open",
  },
  products: {
    title: "Products",
    subtitle: "Create, edit and delete the products in your catalog.",
    newProduct: "New product",
    createTitle: "New product",
    editTitle: "Edit product",
    loading: "Loading products...",
    loadingOne: "Loading product...",
    searching: "Searching...",
    search: "Search products",
    searchPlaceholder: "Search by name, SKU or category",
    empty: "There are no products yet.",
    noResults: "No products match your search.",
    outOfStock: "Out of stock",
    deleteConfirm: (name: string) => `Delete "${name}"?`,
    backToList: "Back to products",
    columns: {
      name: "Name",
      sku: "SKU",
      category: "Category",
      price: "Price",
      stock: "Stock",
      actions: "Actions",
    },
  },
  form: {
    name: "Name",
    sku: "SKU",
    category: "Category",
    price: "Price",
    stock: "Stock",
    skuHint: "3 to 20 characters: letters, numbers or dashes.",
  },
  validation: {
    required: "This field is required.",
    minLength: "Must be at least 2 characters.",
    invalidSku: "Use 3 to 20 letters, numbers or dashes.",
    positive: "Must be a number greater than 0.",
    nonNegativeInteger: "Must be a whole number of 0 or more.",
  },
  errors: {
    INVALID_CREDENTIALS: "Incorrect username or password.",
    PRODUCT_NOT_FOUND: "The product does not exist or was deleted.",
    SKU_TAKEN: "Another product already uses this SKU.",
    VALIDATION_ERROR: "Please review the form fields.",
    UNKNOWN: "Something went wrong. Please try again.",
  },
};

export type Dictionary = typeof en;
