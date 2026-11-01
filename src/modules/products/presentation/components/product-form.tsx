"use client";

import { useForm } from "react-hook-form";

import type { ProductDto, ProductInput } from "@/modules/products/application/product.dto";
import {
  PRODUCT_FORM_FIELDS,
  productFormResolver,
  toProductFormValues,
  toProductInput,
  type ProductFormField,
  type ProductFormValues,
} from "@/modules/products/presentation/forms/product-form.resolver";
import type { Result } from "@/shared/domain/result";
import { translateFieldError } from "@/shared/i18n/translate-field-error";
import { useTranslations } from "@/shared/i18n/use-translations";
import { cn } from "@/shared/lib/utils";
import { FormField } from "@/shared/presentation/components/form-field";
import { Button } from "@/shared/presentation/ui/button";
import { Input } from "@/shared/presentation/ui/input";
import { Spinner } from "@/shared/presentation/ui/spinner";

interface ProductFormProps {
  /** Valores iniciales (modo edición). Sin ellos, el formulario empieza vacío. */
  initialValues?: ProductInput;
  submitLabel: string;
  /** Lo decide la página: crear o actualizar. El formulario solo valida y muestra el resultado. */
  onSubmit: (input: ProductInput) => Promise<Result<ProductDto>>;
  onCancel?: () => void;
}

const INPUT_MODES: Partial<Record<ProductFormField, "decimal" | "numeric">> = {
  price: "decimal",
  stock: "numeric",
};

/**
 * Formulario de producto con react-hook-form.
 *
 * Validación (todas con las reglas del dominio, vía productFormResolver):
 *  - al salir de un campo (blur);
 *  - mientras corriges un campo que ya tenía error;
 *  - al enviar: valida todo y pone el foco en el primer campo con error.
 *
 * Si la API responde con un error de un campo (p. ej. SKU repetido), se muestra
 * debajo de ESE campo; si es un error general, arriba de los botones.
 */
export function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: productFormResolver,
    mode: "onTouched",
    defaultValues: toProductFormValues(initialValues),
  });

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit(toProductInput(values));
    if (result.ok) return;

    const field = result.error.field as ProductFormField | undefined;
    if (field && PRODUCT_FORM_FIELDS.includes(field)) {
      setError(field, { type: result.error.reason ?? result.error.code }, { shouldFocus: true });
    } else {
      setError("root.server", { type: result.error.code });
    }
  });

  const serverError = translateFieldError(t, errors.root?.server);

  return (
    <form onSubmit={submit} noValidate>
      <fieldset disabled={isSubmitting} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCT_FORM_FIELDS.map((field) => {
            const id = `product-${field}`;
            const error = errors[field];

            return (
              <FormField
                key={field}
                id={id}
                label={t.form[field]}
                hint={field === "sku" ? t.form.skuHint : undefined}
                error={translateFieldError(t, error)}
                className={cn(field === "name" && "sm:col-span-2")}
              >
                {(describedBy) => (
                  <Input
                    id={id}
                    inputMode={INPUT_MODES[field]}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    {...register(field)}
                  />
                )}
              </FormField>
            );
          })}
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t.common.cancel}
            </Button>
          )}
          <Button type="submit">
            {isSubmitting && <Spinner />}
            {isSubmitting ? t.common.saving : submitLabel}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
