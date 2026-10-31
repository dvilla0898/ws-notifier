"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";

import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateError } from "@/i18n/translate-error";
import { useTranslations } from "@/i18n/use-translations";
import { useLocaleStore } from "@/stores/locale-store";
import { useProductsStore } from "@/stores/products-store";

/**
 * Listado de productos con búsqueda y eliminación.
 *
 * Estados que maneja (y que los tests verifican):
 *  - cargando  -> mientras la API "responde" (1 s)
 *  - error     -> mensaje + botón Reintentar
 *  - vacío     -> no hay productos
 *  - sin resultados -> la búsqueda no encontró nada
 *  - lista     -> tabla con acciones Editar / Eliminar (con confirmación)
 */
export function ProductsTable() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const items = useProductsStore((state) => state.items);
  const status = useProductsStore((state) => state.status);
  const errorCode = useProductsStore((state) => state.errorCode);
  const deletingId = useProductsStore((state) => state.deletingId);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);

  const [query, setQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Al montar el componente pedimos la lista a la API.
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
        style: "currency",
        currency: "USD",
      }),
    [locale],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((product) =>
      [product.name, product.sku, product.category].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [items, query]);

  async function handleDelete(id: string) {
    setActionError(null);
    const result = await deleteProduct(id);
    setConfirmingId(null);
    if (!result.ok) {
      setActionError(translateError(t, result.errorCode));
    }
  }

  if (status === "idle" || status === "loading") {
    return <LoadingState label={t.products.loading} />;
  }

  if (status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-sm text-destructive">
        <p>{translateError(t, errorCode)}</p>
        <Button variant="outline" onClick={() => void fetchProducts()}>
          {t.common.retry}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Label htmlFor="product-search" className="sr-only">
          {t.products.search}
        </Label>
        <div className="relative max-w-sm">
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
      </CardHeader>

      <CardContent className="space-y-4">
        {actionError && (
          <p role="alert" className="text-sm text-destructive">
            {actionError}
          </p>
        )}

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t.products.empty}</p>
        ) : filtered.length === 0 ? (
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
              {filtered.map((product) => {
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
