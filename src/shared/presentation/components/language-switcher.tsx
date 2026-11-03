"use client";

import { SUPPORTED_LOCALES } from "@/shared/i18n/config";
import { useTranslations } from "@/shared/i18n/use-translations";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/shared/i18n/locale.store";

/** Botones EN / ES. `aria-pressed` indica cuál está activo. */
export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div role="group" aria-label={t.common.language} className="inline-flex rounded-md border p-0.5">
      {SUPPORTED_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "min-h-9 min-w-10 rounded px-2 text-xs font-medium uppercase transition-colors md:min-h-0 md:min-w-0 md:py-0.5",
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
