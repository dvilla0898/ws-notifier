"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { ProductDto } from "@/modules/products/application/product.dto";
import { useProductsStore } from "@/modules/products/presentation/products.store";
import { AppError } from "@/shared/domain/app-error";
import { translateError } from "@/shared/i18n/translate-error";
import { useTranslations } from "@/shared/i18n/use-translations";
import { LoadingState } from "@/shared/presentation/components/loading-state";
import { Button } from "@/shared/presentation/ui/button";
import { Card, CardContent } from "@/shared/presentation/ui/card";

import { ProductForm } from "./product-form";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; product: ProductDto }
  | { status: "error"; error: AppError };

/**
 * Pantalla de edición. El id llega por query string: /dashboard/products/edit?id=p1
 *
 * ¿Por qué no /dashboard/products/[id]? Con `output: "export"` las rutas dinámicas
 * deben conocerse en el build, pero los productos se crean en el navegador.
 */
export function EditProductView() {
  const t = useTranslations();
  const router = useRouter();
  const id = useSearchParams().get("id");
  const getProduct = useProductsStore((state) => state.getProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!id) return;

    // `cancelled` evita actualizar el estado si el usuario sale antes de que responda.
    let cancelled = false;
    void getProduct(id).then((result) => {
      if (cancelled) return;
      setState(
        result.ok ? { status: "ready", product: result.value } : { status: "error", error: result.error },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [id, getProduct]);

  const goToList = () => router.push("/dashboard/products");

  if (!id || state.status === "error") {
    const error =
      state.status === "error" ? state.error : new AppError("PRODUCT_NOT_FOUND", "Missing product id");
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-sm text-destructive">
        <p>{translateError(t, error)}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">{t.products.backToList}</Link>
        </Button>
      </div>
    );
  }

  if (state.status === "loading") {
    return <LoadingState label={t.products.loadingOne} />;
  }

  const { product } = state;

  return (
    <Card>
      <CardContent>
        <ProductForm
          key={product.id}
          initialValues={{
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
          }}
          submitLabel={t.common.save}
          onSubmit={async (input) => {
            const result = await updateProduct(product.id, input);
            if (result.ok) goToList();
            return result;
          }}
          onCancel={goToList}
        />
      </CardContent>
    </Card>
  );
}
