"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { translateError } from "@/i18n/translate-error";
import { useTranslations } from "@/i18n/use-translations";
import { toErrorCode } from "@/lib/mock-api/errors";
import { getProduct } from "@/lib/mock-api/products-api";
import { useProductsStore } from "@/stores/products-store";
import type { Product } from "@/types";

import { ProductForm } from "./product-form";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; product: Product }
  | { status: "error"; errorCode: string };

/**
 * Pantalla de edición. El id llega por query string: /dashboard/products/edit?id=p1
 *
 * ¿Por qué no /dashboard/products/[id]? Con `output: "export"` las rutas dinámicas
 * deben conocerse en el build (generateStaticParams), pero nuestros productos
 * viven en localStorage y cambian en tiempo de ejecución.
 */
export function EditProductView() {
  const t = useTranslations();
  const router = useRouter();
  const id = useSearchParams().get("id");
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!id) return;

    // `cancelled` evita actualizar el estado si el usuario sale antes de que responda la API.
    let cancelled = false;
    getProduct(id)
      .then((product) => {
        if (!cancelled) setState({ status: "ready", product });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", errorCode: toErrorCode(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goToList = () => router.push("/dashboard/products");

  if (!id || state.status === "error") {
    const code = state.status === "error" ? state.errorCode : "NOT_FOUND";
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-sm text-destructive">
        <p>{translateError(t, code)}</p>
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
