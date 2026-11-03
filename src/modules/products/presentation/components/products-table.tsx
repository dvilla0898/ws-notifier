"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";

import type { ProductDto } from "@/modules/products/application/product.dto";
import { useProductsStore } from "@/modules/products/presentation/products.store";
import type { Dictionary } from "@/shared/i18n/dictionaries";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { translateError } from "@/shared/i18n/translate-error";
import { useTranslations } from "@/shared/i18n/use-translations";
import { TableSkeleton } from "@/shared/presentation/components/skeletons";
import { Button } from "@/shared/presentation/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/presentation/ui/card";
import { Input } from "@/shared/presentation/ui/input";
import { Label } from "@/shared/presentation/ui/label";
import { Spinner } from "@/shared/presentation/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/presentation/ui/table";

import { DeleteProductDialog } from "./delete-product-dialog";

/** Espera tras la última tecla antes de buscar (evita una "petición" por letra). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Columnas de la tabla de escritorio (el skeleton usa el mismo número). */
const COLUMN_COUNT = 6;

interface ActionsProps {
  product: ProductDto;
  t: Dictionary;
  onDelete: (product: ProductDto) => void;
}

/** Botones Editar / Eliminar, compartidos por la tarjeta (móvil) y la fila (escritorio). */
function ProductActions({ product, t, onDelete }: ActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button asChild size="icon" variant="ghost">
        <Link
          href={`/dashboard/products/edit?id=${encodeURIComponent(product.id)}`}
          aria-label={`${t.common.edit} ${product.name}`}
        >
          <Pencil aria-hidden="true" />
        </Link>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label={`${t.common.delete} ${product.name}`}
        onClick={() => onDelete(product)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

function StockValue({ product, t }: { product: ProductDto; t: Dictionary }) {
  return product.stock === 0 ? (
    <span className="text-destructive">{t.products.outOfStock}</span>
  ) : (
    <span>{product.stock}</span>
  );
}

/**
 * Listado de productos.
 *
 * Casos de uso (a través del store): list-products al montarse, search-products al
 * escribir (con debounce) y delete-product al confirmar en el diálogo.
 *
 * Vista responsive: tarjetas en móvil (< md) y tabla en escritorio (≥ md).
 * Ambas se renderizan y el CSS muestra la que corresponde; así no hay saltos
 * al cargar la página ni diferencias entre el HTML estático y el navegador.
 */
export function ProductsTable() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const items = useProductsStore((state) => state.items);
  const status = useProductsStore((state) => state.status);
  const error = useProductsStore((state) => state.error);
  const searchResults = useProductsStore((state) => state.searchResults);
  const isSearching = useProductsStore((state) => state.isSearching);
  const deletingId = useProductsStore((state) => state.deletingId);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const searchProducts = useProductsStore((state) => state.searchProducts);
  const clearSearch = useProductsStore((state) => state.clearSearch);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);

  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<ProductDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void fetchProducts();
    return () => clearSearch();
  }, [fetchProducts, clearSearch]);

  // Debounce: busca 300 ms después de la última tecla. Texto vacío = sin búsqueda.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      clearSearch();
      return;
    }
    const timer = setTimeout(() => void searchProducts(term), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, searchProducts, clearSearch]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
        style: "currency",
        currency: "USD",
      }),
    [locale],
  );

  async function handleConfirmDelete(product: ProductDto) {
    setActionError(null);
    const result = await deleteProduct(product.id);
    setToDelete(null);
    if (!result.ok) setActionError(translateError(t, result.error));
  }

  if (status === "idle" || status === "loading") {
    return <TableSkeleton label={t.products.loading} columns={COLUMN_COUNT} />;
  }

  if (status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-sm text-destructive">
        <p>{translateError(t, error)}</p>
        <Button variant="outline" onClick={() => void fetchProducts()}>
          {t.common.retry}
        </Button>
      </div>
    );
  }

  const visible = searchResults ?? items;

  return (
    <Card>
      <CardHeader>
        <Label htmlFor="product-search" className="sr-only">
          {t.products.search}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="product-search"
              type="search"
              placeholder={t.products.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 pl-8 md:h-9"
            />
          </div>
          {isSearching && (
            <span role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Spinner />
              {t.products.searching}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {actionError && (
          <p role="alert" className="text-sm text-destructive">
            {actionError}
          </p>
        )}

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t.products.empty}</p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t.products.noResults}</p>
        ) : (
          <>
            {/* Móvil: una tarjeta por producto */}
            <ul aria-label={t.products.title} className="space-y-3 md:hidden">
              {visible.map((product) => (
                <li key={product.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium break-words">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono">{product.sku}</span> · {product.category}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">{currency.format(product.price)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t.products.columns.stock}: </span>
                      <StockValue product={product} t={t} />
                    </p>
                    <ProductActions product={product} t={t} onDelete={setToDelete} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Escritorio: tabla */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.products.columns.name}</TableHead>
                    <TableHead>{t.products.columns.sku}</TableHead>
                    <TableHead>{t.products.columns.category}</TableHead>
                    <TableHead className="text-right">{t.products.columns.price}</TableHead>
                    <TableHead className="text-right">{t.products.columns.stock}</TableHead>
                    <TableHead className="text-right">{t.products.columns.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {currency.format(product.price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <StockValue product={product} t={t} />
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActions product={product} t={t} onDelete={setToDelete} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      <DeleteProductDialog
        product={toDelete}
        isDeleting={toDelete !== null && deletingId === toDelete.id}
        onConfirm={(product) => void handleConfirmDelete(product)}
        onCancel={() => setToDelete(null)}
      />
    </Card>
  );
}
