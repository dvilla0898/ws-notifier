"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductsTable } from "@/components/products/products-table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/use-translations";

export default function ProductsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.products.title}
        description={t.products.subtitle}
        actions={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus aria-hidden="true" />
              {t.products.newProduct}
            </Link>
          </Button>
        }
      />
      <ProductsTable />
    </div>
  );
}
