"use client";

import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/shared/presentation/components/page-header";
import { Button } from "@/shared/presentation/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/ui/card";
import { useTranslations } from "@/shared/i18n/use-translations";
import { selectUser, useAuthStore } from "@/modules/auth/presentation/auth.store";

/** Inicio del panel: bienvenida y accesos a los módulos. */
export default function DashboardPage() {
  const t = useTranslations();
  const user = useAuthStore(selectUser);

  return (
    <div className="space-y-6">
      <PageHeader title={t.dashboard.welcome(user?.name ?? "")} description={t.dashboard.subtitle} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" aria-hidden="true" />
              {t.nav.products}
            </CardTitle>
            <CardDescription>{t.dashboard.productsDescription}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/products">{t.dashboard.open}</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="opacity-70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" aria-hidden="true" />
              {t.nav.sales}
            </CardTitle>
            <CardDescription>{t.dashboard.salesDescription}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" disabled>
              {t.common.comingSoon}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
