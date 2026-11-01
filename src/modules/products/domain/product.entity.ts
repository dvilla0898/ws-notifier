import { ok, type Result } from "@/shared/domain/result";

import { Category } from "./value-objects/category";
import { Price } from "./value-objects/price";
import { ProductName } from "./value-objects/product-name";
import { Sku } from "./value-objects/sku";
import { Stock } from "./value-objects/stock";

/** Datos "crudos" con los que se crea o edita un producto (lo que escribe el usuario). */
export interface ProductDraft {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

/** Forma plana del producto: para guardarlo, enviarlo a la UI o compararlo en tests. */
export interface ProductPrimitives extends ProductDraft {
  id: string;
  /** Fechas en formato ISO 8601. */
  createdAt: string;
  updatedAt: string;
}

interface ProductValues {
  name: ProductName;
  sku: Sku;
  category: Category;
  price: Price;
  stock: Stock;
}

interface ProductProps extends ProductValues {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad Product.
 *
 * Diferencia con un value object: una entidad tiene IDENTIDAD (`id`).
 * Dos productos con el mismo precio son productos distintos;
 * dos Price(19.99) son exactamente el mismo valor.
 *
 * Es inmutable: `update()` devuelve un producto nuevo en lugar de modificar este.
 */
export class Product {
  private constructor(private readonly props: ProductProps) {}

  /** Crea un producto nuevo validando cada campo con su value object. */
  static create(draft: ProductDraft, id: string, now: Date): Result<Product> {
    const values = Product.buildValues(draft);
    if (!values.ok) return values;
    return ok(new Product({ id, ...values.value, createdAt: now, updatedAt: now }));
  }

  /**
   * Reconstruye un producto ya guardado (por ejemplo, desde localStorage).
   * Si los datos guardados están corruptos, lanza un error: no es un error del usuario,
   * es un bug o un dato manipulado, y `simulateApiCall` lo convertirá en UNKNOWN.
   */
  static restore(primitives: ProductPrimitives): Product {
    const values = Product.buildValues(primitives);
    if (!values.ok) {
      throw new Error(`Corrupted product record ${primitives.id}: ${values.error.message}`);
    }
    return new Product({
      id: primitives.id,
      ...values.value,
      createdAt: new Date(primitives.createdAt),
      updatedAt: new Date(primitives.updatedAt),
    });
  }

  /** Valida en orden y devuelve el PRIMER error encontrado. */
  private static buildValues(draft: ProductDraft): Result<ProductValues> {
    const name = ProductName.create(draft.name);
    if (!name.ok) return name;
    const sku = Sku.create(draft.sku);
    if (!sku.ok) return sku;
    const category = Category.create(draft.category);
    if (!category.ok) return category;
    const price = Price.create(draft.price);
    if (!price.ok) return price;
    const stock = Stock.create(draft.stock);
    if (!stock.ok) return stock;

    return ok({
      name: name.value,
      sku: sku.value,
      category: category.value,
      price: price.value,
      stock: stock.value,
    });
  }

  /** Devuelve una NUEVA versión del producto con los cambios (conserva id y createdAt). */
  update(draft: ProductDraft, now: Date): Result<Product> {
    const values = Product.buildValues(draft);
    if (!values.ok) return values;
    return ok(new Product({ ...this.props, ...values.value, updatedAt: now }));
  }

  /** Regla de búsqueda del negocio: coincide por nombre, SKU o categoría (sin mayúsculas). */
  matches(term: string): boolean {
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    return [this.name.value, this.sku.value, this.category.value].some((value) =>
      value.toLowerCase().includes(needle),
    );
  }

  get id(): string {
    return this.props.id;
  }
  get name(): ProductName {
    return this.props.name;
  }
  get sku(): Sku {
    return this.props.sku;
  }
  get category(): Category {
    return this.props.category;
  }
  get price(): Price {
    return this.props.price;
  }
  get stock(): Stock {
    return this.props.stock;
  }

  toPrimitives(): ProductPrimitives {
    return {
      id: this.props.id,
      name: this.props.name.value,
      sku: this.props.sku.value,
      category: this.props.category.value,
      price: this.props.price.amount,
      stock: this.props.stock.units,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
