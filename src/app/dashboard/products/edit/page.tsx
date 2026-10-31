"use client";

import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { EditProductView } from "@/components/products/edit-product-view";
import { useTranslations } from "@/i18n/use-translations";

export default function EditProductPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <PageHeader title={t.products.editTitle} />
      {/* useSearchParams() necesita un <Suspense> para que Next.js pueda generar la página estática. */}
      <Suspense fallback={<LoadingState label={t.common.loading} />}>
        <EditProductView />
      </Suspense>
    </div>
  );
}
