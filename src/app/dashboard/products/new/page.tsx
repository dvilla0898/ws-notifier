"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/shared/presentation/components/page-header";
import { ProductForm } from "@/modules/products/presentation/components/product-form";
import { Card, CardContent } from "@/shared/presentation/ui/card";
import { useTranslations } from "@/shared/i18n/use-translations";
import { useProductsStore } from "@/modules/products/presentation/products.store";

export default function NewProductPage() {
  const t = useTranslations();
  const router = useRouter();
  const createProduct = useProductsStore((state) => state.createProduct);

  const goToList = () => router.push("/dashboard/products");

  return (
    <div className="space-y-6">
      <PageHeader title={t.products.createTitle} />
      <Card>
        <CardContent>
          <ProductForm
            submitLabel={t.common.save}
            onSubmit={async (input) => {
              const result = await createProduct(input);
              if (result.ok) goToList();
              return result;
            }}
            onCancel={goToList}
          />
        </CardContent>
      </Card>
    </div>
  );
}
