"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { translateError } from "@/i18n/translate-error";
import { useTranslations } from "@/i18n/use-translations";
import { cn } from "@/lib/utils";
import {
  isValidProduct,
  validateProduct,
  type ProductField,
  type ProductValidationErrors,
} from "@/lib/validation/product";
import type { MutationResult, ProductInput } from "@/types";

interface ProductFormProps {
  /** Valores iniciales (modo edición). Sin ellos, el formulario empieza vacío. */
  initialValues?: ProductInput;
  submitLabel: string;
  /** Lo decide la página: crear o actualizar. El formulario solo valida y muestra el resultado. */
  onSubmit: (input: ProductInput) => Promise<MutationResult>;
  onCancel?: () => void;
}

/** En el formulario todo es texto (lo que el usuario escribe); se convierte al enviar. */
type FormValues = Record<ProductField, string>;

const FIELDS: { name: ProductField; inputMode?: "decimal" | "numeric"; wide?: boolean }[] = [
  { name: "name", wide: true },
  { name: "sku" },
  { name: "category" },
  { name: "price", inputMode: "decimal" },
  { name: "stock", inputMode: "numeric" },
];

function toFormValues(initial?: ProductInput): FormValues {
  return {
    name: initial?.name ?? "",
    sku: initial?.sku ?? "",
    category: initial?.category ?? "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
  };
}

/** "19,99" o "19.99" -> 19.99. Texto inválido -> NaN (la validación lo rechaza). */
function parseNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}

function toProductInput(values: FormValues): ProductInput {
  return {
    name: values.name.trim(),
    sku: values.sku.trim().toUpperCase(),
    category: values.category.trim(),
    price: parseNumber(values.price),
    stock: parseNumber(values.stock),
  };
}

/** Campos vacíos -> "required" (tiene prioridad sobre otros errores del mismo campo). */
function findEmptyFields(values: FormValues): ProductValidationErrors {
  const errors: ProductValidationErrors = {};
  (Object.keys(values) as ProductField[]).forEach((field) => {
    if (values[field].trim() === "") errors[field] = "required";
  });
  return errors;
}

export function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const t = useTranslations();
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialValues));
  const [errors, setErrors] = useState<ProductValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: ProductField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Al corregir un campo, quitamos su mensaje de error.
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = toProductInput(values);
    const validationErrors = { ...validateProduct(input), ...findEmptyFields(values) };
    setErrors(validationErrors);
    if (!isValidProduct(validationErrors)) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(input);
      // Si todo salió bien, la página navega a otra ruta; dejamos el botón en "Saving...".
      if (!result.ok) {
        setSubmitError(translateError(t, result.errorCode));
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError(t.errors.UNKNOWN);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, inputMode, wide }) => {
          const id = `product-${name}`;
          const error = errors[name];
          const hintId = name === "sku" ? `${id}-hint` : undefined;
          const errorId = error ? `${id}-error` : undefined;
          const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

          return (
            <div key={name} className={cn("space-y-2", wide && "sm:col-span-2")}>
              <Label htmlFor={id}>{t.form[name]}</Label>
              <Input
                id={id}
                name={name}
                inputMode={inputMode}
                value={values[name]}
                onChange={(event) => handleChange(name, event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
              />
              {hintId && (
                <p id={hintId} className="text-xs text-muted-foreground">
                  {t.form.skuHint}
                </p>
              )}
              {error && (
                <p id={errorId} className="text-sm text-destructive">
                  {t.validation[error]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {submitError && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? t.common.saving : submitLabel}
        </Button>
      </div>
    </form>
  );
}
