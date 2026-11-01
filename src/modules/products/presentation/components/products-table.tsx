"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";

import { useProductsStore } from "@/modules/products/presentation/products.store";
import { useLocaleStore } from "@/shared/i18n/locale.store";
import { translateError } from "@/shared/i18n/translate-error";
import { useTranslations } from "@/shared/i18n/use-translations";
import { LoadingState } from "@/shared/presentation/components/loading-state";
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

/** Espera tras la última tecla antes de buscar (evita una "petición" por letra). */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Listado de productos.
 *
 * Usa tres casos de uso a través del store:
 *  - list-products   al montarse;
 *  - search-products cuando el usuario escribe (con debounce);
 *  - delete-product  al confirmar la eliminación.
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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
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

  async function handleDelete(id: string) {
    setActionError(null);
    const result = await deleteProduct(id);
    setConfirmingId(null);
    if (!result.ok) setActionError(translateError(t, result.error));
  }

  if (status === "idle" || status === "loading") {
    return <LoadingState label={t.products.loading} />;
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
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-sm">
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
              className="pl-8"
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
              {visible.map((product) => {
                const isConfirming = confirmingId === product.id;
                const isDeleting = deletingId === product.id;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {currency.format(product.price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.stock === 0 ? (
                        <span className="text-destructive">{t.products.outOfStock}</span>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isConfirming ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {t.products.deleteConfirm(product.name)}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleDelete(product.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting && <Spinner />}
                            {t.common.confirm}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmingId(null)}
                            disabled={isDeleting}
                          >
                            {t.common.cancel}
                          </Button>
                        </div>
                      ) : (
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
                            onClick={() => setConfirmingId(product.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
