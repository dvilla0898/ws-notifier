"use client";

import { Suspense } from "react";

import { LoadingState } from "@/shared/presentation/components/loading-state";
import { PageHeader } from "@/shared/presentation/components/page-header";
import { EditProductView } from "@/modules/products/presentation/components/edit-product-view";
import { useTranslations } from "@/shared/i18n/use-translations";

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
