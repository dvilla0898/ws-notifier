"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/i18n/use-translations";
import { useProductsStore } from "@/stores/products-store";

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
